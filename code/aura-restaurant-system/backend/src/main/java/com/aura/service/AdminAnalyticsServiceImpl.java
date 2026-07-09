package com.aura.service;

import com.aura.dto.admin.AdminStatsResponse;
import com.aura.dto.admin.RevenueResponse;
import com.aura.system.repositories.OrderRepository;
//import com.aura.service.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.aura.dto.admin.StaffResponse;
import com.aura.system.repositories.StaffRepository;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;
@Service
@RequiredArgsConstructor
public class AdminAnalyticsServiceImpl implements AdminAnalyticsService {

    private static final String CURRENCY = "USD";
    private static final String PAID_STATUS = "PAID";

    private final OrderRepository orderRepository;
    private final StaffRepository staffRepository;

    // All figures come from the orders table only (Order.status is the single
    // source of truth) — Payment rows aren't consulted, since cash/card/mark-paid
    // flows update Order.status directly and never write a Payment row.
    @Override
    public AdminStatsResponse getStats() {

        float  confirmedRevenue  = orderRepository.sumTotalsByStatus(PAID_STATUS);
        float  pendingOrderTotal = orderRepository.sumTotalsByStatusNot(PAID_STATUS);
        long   activeOrders      = orderRepository.countByStatusNot(PAID_STATUS);
        double avgDeliveryMins   = calcAvgDeliveryMins();

        return AdminStatsResponse.builder()
                .confirmedRevenue(round(confirmedRevenue))
                .pendingOrderTotal(round(pendingOrderTotal))
                .activeOrders(activeOrders)
                .avgDeliveryMins(round(avgDeliveryMins))
                .build();
    }

    @Override
    public RevenueResponse getRevenue(String status) {

        float total = PAID_STATUS.equalsIgnoreCase(status)
                ? orderRepository.sumTotalsByStatus(PAID_STATUS)
                : orderRepository.sumTotalsByStatusNot(PAID_STATUS);

        return RevenueResponse.builder()
                .total(round(total))
                .currency(CURRENCY)
                .build();
    }

    // ─── private helpers ──────────────────────────────────────────────────────

    /**
     * Average delivery time in minutes across all DELIVERED orders.
     *
     * Placeholder — returns 0.0 until you add a `deliveredAt` (LocalDateTime)
     * field to your Order entity. Once added:
     *
     * 1. Add this query to OrderRepository:
     *    @Query("SELECT AVG(FUNCTION('TIMESTAMPDIFF', MINUTE, o.orderTime, o.deliveredAt))
     *            FROM Order o WHERE o.status = 'delivered' AND o.deliveredAt IS NOT NULL")
     *    Double avgDeliveryMinutes();
     *
     * 2. Replace this method body with:
     *    Double avg = orderRepository.avgDeliveryMinutes();
     *    return avg != null ? avg : 0.0;
     *
     * 3. Set order.setDeliveredAt(LocalDateTime.now()) in OrderService
     *    when status changes to "delivered".
     */
    private double calcAvgDeliveryMins() {
        return 0.0;
    }

    /** Rounds to 2 decimal places for clean JSON output. */
    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    // Add @Transactional to fix LazyInitializationException
    @Override
    @Transactional(readOnly = true)
    public List<StaffResponse> getStaffList() {
        return staffRepository.findAll().stream()
                .map(staff -> {
                    var account = staff.getAccount();
                    // If account is null, we safely return defaults instead of crashing
                    return StaffResponse.builder()
                            .id(staff.getId())
                            .username(account != null ? account.getUsername() : "No Username")
                            .firstName(staff.getFirstName() != null ? staff.getFirstName() : "")
                            .lastName(staff.getLastName() != null ? staff.getLastName() : "")
                            .email(staff.getEmail() != null ? staff.getEmail() : "")
                            .phone(staff.getPhone() != null ? staff.getPhone() : "")
                            .role(account != null && account.getRole() != null ? account.getRole().name() : "NONE")
                            .active(account != null && account.isActive())
                            .build();
                })
                .toList();
    }
}
