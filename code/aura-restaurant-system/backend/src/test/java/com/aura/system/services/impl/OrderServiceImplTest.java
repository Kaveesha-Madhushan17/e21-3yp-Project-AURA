package com.aura.system.services.impl;

import com.aura.system.dtos.request.OrderItemRequest;
import com.aura.system.dtos.request.PlaceOrderRequest;
import com.aura.system.dtos.response.OrderResponse;
import com.aura.system.entities.MenuItem;
import com.aura.system.entities.Order;
import com.aura.system.entities.OrderItem;
import com.aura.system.entities.RestaurantTable;
import com.aura.system.mqtt.MqttGateway;
import com.aura.system.mqtt.MqttPublisher;
import com.aura.system.repositories.MenuItemRepository;
import com.aura.system.repositories.OrderItemRepository;
import com.aura.system.repositories.OrderRepository;
import com.aura.system.repositories.RestaurantTableRepository;
import com.aura.system.services.DashboardStatsService;
import com.aura.system.services.RobotFleetService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Assigned to: E/21/113 Dissanayake
 * Module: Order Management
 * Function under test: OrderServiceImpl.placeOrder(PlaceOrderRequest)
 */
@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock private OrderRepository orderRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private MenuItemRepository menuItemRepository;
    @Mock private RestaurantTableRepository tableRepository;
    @Mock private MqttPublisher mqttPublisher;
    @Mock private MqttGateway mqttGateway;
    @Mock private DashboardStatsService dashboardStatsService;
    @Mock private RobotFleetService robotFleetService;

    private OrderServiceImpl orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderServiceImpl(
                orderRepository, orderItemRepository, menuItemRepository, tableRepository,
                mqttPublisher, mqttGateway, new ObjectMapper(), dashboardStatsService, robotFleetService);

        // Repositories echo back whatever they were given, assigning an id once.
        lenient().when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            if (o.getOrderId() == null) o.setOrderId(100);
            return o;
        });
        lenient().when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(inv -> {
            OrderItem i = inv.getArgument(0);
            if (i.getOrderItemId() == null) i.setOrderItemId(1);
            return i;
        });
    }

    private RestaurantTable table(int id, int capacity) {
        return RestaurantTable.builder().tableId(id).tableNumber("T" + id).capacity(capacity).status("OCCUPIED").build();
    }

    private MenuItem menuItem(int id, float price) {
        return MenuItem.builder().menuItemId(id).name("Item" + id).price(price).availability(true).build();
    }

    private OrderItemRequest itemRequest(Integer menuItemId, Integer quantity) {
        OrderItemRequest req = new OrderItemRequest();
        req.setMenuItemId(menuItemId);
        req.setQuantity(quantity);
        return req;
    }

    private PlaceOrderRequest orderRequest(Integer tableId, List<OrderItemRequest> items) {
        PlaceOrderRequest req = new PlaceOrderRequest();
        req.setTableId(tableId);
        req.setItems(items);
        return req;
    }

    // ── EP1: single valid item -> total = price * quantity ──────────────────
    @Test
    @DisplayName("EP1: single valid item -> total computed as price * quantity")
    void placeOrder_withSingleValidItem_calculatesCorrectTotal() {
        when(tableRepository.findById(1)).thenReturn(Optional.of(table(1, 4)));
        when(menuItemRepository.findById(10)).thenReturn(Optional.of(menuItem(10, 500f)));

        PlaceOrderRequest request = orderRequest(1, List.of(itemRequest(10, 2)));

        OrderResponse response = orderService.placeOrder(request);

        assertThat(response.getTotalAmount()).isEqualTo(1000f);
        verify(mqttPublisher, times(1)).publish(eq("aura/kitchen/update-order"), anyString());
        verify(dashboardStatsService, times(1)).publishDashboardStats();
    }

    // ── EP2: multiple valid items -> total = sum of subtotals ───────────────
    @Test
    @DisplayName("EP2: multiple valid items -> total is the sum of all subtotals")
    void placeOrder_withMultipleItems_sumsAllSubtotals() {
        when(tableRepository.findById(1)).thenReturn(Optional.of(table(1, 4)));
        when(menuItemRepository.findById(10)).thenReturn(Optional.of(menuItem(10, 500f)));
        when(menuItemRepository.findById(20)).thenReturn(Optional.of(menuItem(20, 300f)));

        PlaceOrderRequest request = orderRequest(1, List.of(itemRequest(10, 1), itemRequest(20, 3)));

        OrderResponse response = orderService.placeOrder(request);

        // 500*1 + 300*3 = 1400
        assertThat(response.getTotalAmount()).isEqualTo(1400f);
        assertThat(response.getItems()).hasSize(2);
    }

    // ── EP3: nonexistent table -> EntityNotFoundException, nothing persisted ─
    @Test
    @DisplayName("EP3: nonexistent table -> EntityNotFoundException, no order persisted")
    void placeOrder_withNonexistentTable_throwsEntityNotFoundException() {
        when(tableRepository.findById(99)).thenReturn(Optional.empty());

        PlaceOrderRequest request = orderRequest(99, List.of(itemRequest(10, 1)));

        assertThatThrownBy(() -> orderService.placeOrder(request))
                .isInstanceOf(EntityNotFoundException.class);

        verify(orderRepository, never()).save(any());
    }

    // ── EP4: nonexistent menu item mid-list -> EntityNotFoundException ──────
    @Test
    @DisplayName("EP4: menu item not found mid-list -> EntityNotFoundException")
    void placeOrder_withNonexistentMenuItemMidList_throwsEntityNotFoundException() {
        when(tableRepository.findById(1)).thenReturn(Optional.of(table(1, 4)));
        when(menuItemRepository.findById(10)).thenReturn(Optional.of(menuItem(10, 500f)));
        when(menuItemRepository.findById(999)).thenReturn(Optional.empty());

        PlaceOrderRequest request = orderRequest(1, List.of(itemRequest(10, 1), itemRequest(999, 1)));

        assertThatThrownBy(() -> orderService.placeOrder(request))
                .isInstanceOf(EntityNotFoundException.class);

        // NOTE: Mockito mocks don't enforce real DB rollback. Whether item #1
        // is actually rolled back by @Transactional needs a separate
        // integration test against a real (or embedded) database.
    }

    // ── EP5: MQTT broker down -> order still saved and returned ─────────────
    @Test
    @DisplayName("EP5: MQTT publish throws -> exception is swallowed, order still returned")
    void placeOrder_whenMqttPublishThrows_stillReturnsOrder() {
        when(tableRepository.findById(1)).thenReturn(Optional.of(table(1, 4)));
        when(menuItemRepository.findById(10)).thenReturn(Optional.of(menuItem(10, 500f)));
        doThrow(new RuntimeException("Broker down")).when(mqttPublisher).publish(anyString(), anyString());

        PlaceOrderRequest request = orderRequest(1, List.of(itemRequest(10, 1)));

        OrderResponse response = orderService.placeOrder(request);

        assertThat(response).isNotNull();
        assertThat(response.getTotalAmount()).isEqualTo(500f);
    }

    // ── Boundary (gap): quantity = 0 is accepted, subtotal = 0 ──────────────
    @Test
    @DisplayName("Boundary/gap: quantity=0 bypasses @Min(1) at service level, subtotal=0 accepted")
    void placeOrder_withZeroQuantity_acceptsZeroSubtotal() {
        when(tableRepository.findById(1)).thenReturn(Optional.of(table(1, 4)));
        when(menuItemRepository.findById(10)).thenReturn(Optional.of(menuItem(10, 500f)));

        PlaceOrderRequest request = orderRequest(1, List.of(itemRequest(10, 0)));

        OrderResponse response = orderService.placeOrder(request);

        assertThat(response.getTotalAmount()).isEqualTo(0f);
    }

    // ── Error/negative (real defect): negative quantity reduces the total ───
    @Test
    @DisplayName("Error case/gap: negative quantity silently reduces the order total")
    void placeOrder_withNegativeQuantity_reducesTotal() {
        when(tableRepository.findById(1)).thenReturn(Optional.of(table(1, 4)));
        when(menuItemRepository.findById(10)).thenReturn(Optional.of(menuItem(10, 100f)));
        when(menuItemRepository.findById(20)).thenReturn(Optional.of(menuItem(20, 50f)));

        PlaceOrderRequest request = orderRequest(1, List.of(itemRequest(10, 2), itemRequest(20, -1)));

        OrderResponse response = orderService.placeOrder(request);

        // 100*2 + 50*(-1) = 150 -- a negative quantity should never be allowed
        // to reach this calculation; flagged as a defect in the Step 3 review.
        assertThat(response.getTotalAmount()).isEqualTo(150f);
    }

    // ── Boundary: empty items list -> zero-total order created ──────────────
    @Test
    @DisplayName("Boundary/gap: empty items list bypasses @NotEmpty, creates a zero-item order")
    void placeOrder_withEmptyItemsList_createsZeroTotalOrder() {
        when(tableRepository.findById(1)).thenReturn(Optional.of(table(1, 4)));

        PlaceOrderRequest request = orderRequest(1, List.of());

        OrderResponse response = orderService.placeOrder(request);

        assertThat(response.getTotalAmount()).isEqualTo(0f);
        assertThat(response.getItems()).isEmpty();
    }
}
