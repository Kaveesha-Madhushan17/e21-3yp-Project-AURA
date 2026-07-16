package com.aura.system.services.impl;

import com.aura.system.mqtt.MqttPublisher;
import com.aura.system.repositories.OrderRepository;
import com.aura.system.repositories.PaymentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Assigned to: E/21/245 Madhushan
 * Module: Admin Analytics
 * Function under test: DashboardStatsServiceImpl.getDashboardStats()
 */
@ExtendWith(MockitoExtension.class)
class DashboardStatsServiceImplTest {

    @Mock private OrderRepository orderRepository;
    @Mock private PaymentRepository paymentRepository; // unused by this method, mocked only for construction
    @Mock private MqttPublisher mqttPublisher;          // unused by this method

    private DashboardStatsServiceImpl dashboardStatsService;

    @BeforeEach
    void setUp() {
        dashboardStatsService = new DashboardStatsServiceImpl(
                orderRepository, paymentRepository, mqttPublisher, new ObjectMapper());
    }

    // ── EP1: mixed orders -> all three aggregates non-zero and consistent ───
    @Test
    @DisplayName("EP1: mixed paid/unpaid orders -> confirmedRevenue, activeOrderCount, pendingTotal all correct")
    void getDashboardStats_withMixedOrders_returnsCorrectAggregates() {
        when(orderRepository.sumTotalsByStatus("PAID")).thenReturn(5000f);
        when(orderRepository.countByStatusNot("PAID")).thenReturn(3L);
        when(orderRepository.sumTotalsByStatusNot("PAID")).thenReturn(1500f);

        Map<String, Object> stats = dashboardStatsService.getDashboardStats();

        assertThat(stats.get("confirmedRevenue")).isEqualTo(5000f);
        assertThat(stats.get("activeOrderCount")).isEqualTo(3L);
        assertThat(stats.get("pendingTotal")).isEqualTo(1500f);
    }

    // ── EP2: all orders PAID -> activeOrderCount & pendingTotal are zero ────
    @Test
    @DisplayName("EP2: all orders PAID -> activeOrderCount=0, pendingTotal=0.0")
    void getDashboardStats_withAllOrdersPaid_activeCountAndPendingAreZero() {
        when(orderRepository.sumTotalsByStatus("PAID")).thenReturn(10000f);
        when(orderRepository.countByStatusNot("PAID")).thenReturn(0L);
        when(orderRepository.sumTotalsByStatusNot("PAID")).thenReturn(0f);

        Map<String, Object> stats = dashboardStatsService.getDashboardStats();

        assertThat(stats.get("activeOrderCount")).isEqualTo(0L);
        assertThat(stats.get("pendingTotal")).isEqualTo(0f);
    }

    // ── EP3: all orders unpaid -> confirmedRevenue is zero ───────────────────
    @Test
    @DisplayName("EP3: all orders unpaid -> confirmedRevenue=0.0")
    void getDashboardStats_withAllOrdersUnpaid_confirmedRevenueIsZero() {
        when(orderRepository.sumTotalsByStatus("PAID")).thenReturn(0f);
        when(orderRepository.countByStatusNot("PAID")).thenReturn(5L);
        when(orderRepository.sumTotalsByStatusNot("PAID")).thenReturn(2500f);

        Map<String, Object> stats = dashboardStatsService.getDashboardStats();

        assertThat(stats.get("confirmedRevenue")).isEqualTo(0f);
    }

    // ── Boundary: zero orders in the system -> all metrics zero, no NPE ─────
    @Test
    @DisplayName("Boundary: no orders at all -> all metrics are zero (relies on COALESCE in JPQL)")
    void getDashboardStats_withNoOrders_allZero() {
        when(orderRepository.sumTotalsByStatus("PAID")).thenReturn(0f);
        when(orderRepository.countByStatusNot("PAID")).thenReturn(0L);
        when(orderRepository.sumTotalsByStatusNot("PAID")).thenReturn(0f);

        Map<String, Object> stats = dashboardStatsService.getDashboardStats();

        assertThat(stats.get("confirmedRevenue")).isEqualTo(0f);
        assertThat(stats.get("activeOrderCount")).isEqualTo(0L);
        assertThat(stats.get("pendingTotal")).isEqualTo(0f);
    }

    // ── Error case: repository throws -> must degrade to a zeroed map ───────
    @Test
    @DisplayName("Error case: repository throws (simulated DB outage) -> returns zeroed map, no exception")
    void getDashboardStats_whenRepositoryThrows_returnsZeroedMapInstead() {
        when(orderRepository.sumTotalsByStatus(anyString())).thenThrow(new RuntimeException("DB connection lost"));

        Map<String, Object> stats = dashboardStatsService.getDashboardStats();

        assertThat(stats.get("confirmedRevenue")).isEqualTo(0.0f);
        assertThat(stats.get("activeOrderCount")).isEqualTo(0);
        assertThat(stats.get("pendingTotal")).isEqualTo(0.0f);
    }
}
