package com.aura.system.services.impl;

import com.aura.system.dtos.request.CreateReservationRequest;
import com.aura.system.dtos.response.ReservationResponse;
import com.aura.system.dtos.response.TableAvailabilityResponse;
import com.aura.system.dtos.response.SlotAvailabilityResponse;
import com.aura.system.dtos.response.AvailabilityCheckResponse;
import com.aura.system.entities.Reservation;
import com.aura.system.entities.RestaurantTable;
import com.aura.system.services.ReservationService;
import com.aura.system.repositories.ReservationRepository;
import com.aura.system.repositories.RestaurantTableRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.aura.exception.ReservationConflictException;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository    reservationRepository;
    private final RestaurantTableRepository tableRepository;
    private final JavaMailSender             mailSender;

    @Value("${aura.notifications.enabled:false}")
    private boolean notificationsEnabled;

    @Value("${aura.notifications.recipient:pdnprojectaura17@gmail.com}")
    private String notificationRecipient;

    @Value("${aura.notifications.sender:pdnprojectaura17@gmail.com}")
    private String notificationSender;

    // A reservation blocks the table for 2 hours either side
    private static final int SLOT_HOURS = 2;

    // ── Create Reservation ───────────────────────────────────────────────────

    @Override
    @Transactional
    public ReservationResponse createReservation(CreateReservationRequest request) {
        // 1. If a specific table number was requested, try to reserve that table
        RestaurantTable assignedTable = null;
        if (request.getTableNumber() != null && !request.getTableNumber().isBlank()) {
            // resilient lookup similar to availability lookup
            RestaurantTable requested = tableRepository.findByTableNumber(request.getTableNumber());
            if (requested == null) requested = tableRepository.findByTableNumber("Table " + request.getTableNumber());
            if (requested == null) requested = tableRepository.findByTableNumber(String.valueOf(request.getTableNumber()));
            if (requested == null) {
                throw new jakarta.persistence.EntityNotFoundException("Requested table not found: " + request.getTableNumber());
            }

            LocalDateTime windowStart = request.getReservationTime().minusHours(SLOT_HOURS);
            LocalDateTime windowEnd   = request.getReservationTime().plusHours(SLOT_HOURS);

            List<Reservation> conflicts = reservationRepository
                    .findConflictingReservations(requested.getTableId(), windowStart, windowEnd);

            if (!conflicts.isEmpty()) {
                throw new ReservationConflictException("Selected table " + request.getTableNumber() + " is not available for that time.");
            }

            // table is free — honour the request
            assignedTable = requested;
        } else {
            // 2. Find an available table that fits the party size (auto-assign)
            List<RestaurantTable> tables = tableRepository.findAll();
            for (RestaurantTable table : tables) {
                if (table.getCapacity() >= request.getPartySize()) {
                    LocalDateTime windowStart = request.getReservationTime().minusHours(SLOT_HOURS);
                    LocalDateTime windowEnd   = request.getReservationTime().plusHours(SLOT_HOURS);

                    List<Reservation> conflicts = reservationRepository
                            .findConflictingReservations(table.getTableId(), windowStart, windowEnd);

                    if (conflicts.isEmpty()) {
                        assignedTable = table;
                        break;
                    }
                }
            }

            if (assignedTable == null) {
                throw new ReservationConflictException("No available table found for that time and party size.");
            }
        }

        // 2. Save reservation
        Reservation reservation = Reservation.builder()
                .table(assignedTable)
                .customerName(request.getCustomerName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .partySize(request.getPartySize())
                .reservationTime(request.getReservationTime())
                .status("CONFIRMED")
                .build();

        Reservation saved = reservationRepository.save(reservation);
        log.info("Reservation created | id={} | table={} | time={}",
                saved.getReservationId(), assignedTable.getTableNumber(),
                request.getReservationTime());

        if (notificationsEnabled) {
            // Send emails after transaction commit so failures don't roll back reservation
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    try {
                        sendReservationNotification(saved);
                    } catch (Exception ex) {
                        log.error("Failed to send notification after commit for reservation id={}", saved.getReservationId(), ex);
                        // Do not rethrow — do not affect reservation outcome
                    }
                }
            });
        }

        return mapToResponse(saved);
    }

    // ── Get All Reservations ─────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getAllReservations() {
        return reservationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── Get By ID ────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public ReservationResponse getReservationById(Integer reservationId) {
        return mapToResponse(findOrThrow(reservationId));
    }

    // ── Check Table Availability ─────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public TableAvailabilityResponse checkTableAvailability(
            Integer tableId, LocalDateTime time) {

        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Table not found: " + tableId));

        LocalDateTime windowStart = time.minusHours(SLOT_HOURS);
        LocalDateTime windowEnd   = time.plusHours(SLOT_HOURS);

        List<Reservation> conflicts = reservationRepository
                .findConflictingReservations(tableId, windowStart, windowEnd);

        boolean available = conflicts.isEmpty();

        return TableAvailabilityResponse.builder()
                .tableId(table.getTableId())
                .tableNumber(table.getTableNumber())
                .capacity(table.getCapacity())
                .available(available)
                .checkedFor(time)
                .reason(available ? null :
                        "Already reserved between " + windowStart + " and " + windowEnd)
                .build();
    }
    
    // ── Get Available Slots ──────────────────────────────────────────────────
    
    @Override
    @Transactional(readOnly = true)
    public SlotAvailabilityResponse getAvailableSlots(String dateStr, Integer partySize, String tableNumber) {
        LocalDate date = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
        
        List<SlotAvailabilityResponse.SlotInfo> slots = new ArrayList<>();
        List<RestaurantTable> allTables = partySize == null
            ? tableRepository.findAll()
            : tableRepository.findByCapacityGreaterThanEqual(partySize);

        RestaurantTable specificTable = null;
        if (tableNumber != null && !tableNumber.isBlank()) {
            // Try several lookup strategies to be resilient to stored formats
            specificTable = tableRepository.findByTableNumber(tableNumber);
            if (specificTable == null) {
                // maybe stored as 'Table 3'
                specificTable = tableRepository.findByTableNumber("Table " + tableNumber);
            }
            if (specificTable == null) {
                // maybe numeric stored without prefix
                specificTable = tableRepository.findByTableNumber(String.valueOf(tableNumber));
            }
        }
        
        // Define restaurant hours: 11:00 to 21:00 start times for 2-hour bookings (closing at 23:00)
        for (int hour = 11; hour <= 21; hour++) {
            LocalDateTime slotTime = LocalDateTime.of(date, LocalTime.of(hour, 0));
            
            int availableCount = 0;
            Boolean tableAvailable = null;
            for (RestaurantTable table : allTables) {
                LocalDateTime windowStart = slotTime.minusHours(SLOT_HOURS);
                LocalDateTime windowEnd   = slotTime.plusHours(SLOT_HOURS);
                
                List<Reservation> conflicts = reservationRepository
                        .findConflictingReservations(table.getTableId(), windowStart, windowEnd);
                        
                if (conflicts.isEmpty()) {
                    availableCount++;
                }
                // If a specific table was requested, check its conflicts
                if (specificTable != null && specificTable.getTableId().equals(table.getTableId())) {
                    tableAvailable = conflicts.isEmpty();
                }
            }
            
            boolean slotAvailable = (specificTable != null) ? Boolean.TRUE.equals(tableAvailable) : (availableCount > 0);

            slots.add(SlotAvailabilityResponse.SlotInfo.builder()
                    .time(String.format("%02d:00", hour))
                    .available(slotAvailable)
                    .availableTables(availableCount)
                    .tableAvailable(tableAvailable)
                    .build());
        }
        
        return SlotAvailabilityResponse.builder()
                .date(dateStr)
                .slots(slots)
                .build();
    }

    private void sendReservationNotification(Reservation reservation) {
        try {
            // Admin notification to multiple addresses
            SimpleMailMessage adminMsg = new SimpleMailMessage();
            adminMsg.setFrom(notificationSender);
            adminMsg.setTo(new String[]{"pdnprojectaura17@gmail.com", "kaveeshamadhushan1776@gmail.com"});
            adminMsg.setSubject("New AURA Reservation: " + reservation.getCustomerName());
            adminMsg.setText(
                "New reservation details:\n\n" +
                "Customer Name: " + reservation.getCustomerName() + "\n" +
                "Customer Email: " + reservation.getEmail() + "\n" +
                "Customer Phone: " + reservation.getPhone() + "\n" +
                "Selected Table: " + reservation.getTable().getTableNumber() + "\n" +
                "Reservation Time: " + reservation.getReservationTime() + "\n" +
                "Party Size: " + reservation.getPartySize() + "\n" +
                "Status: " + reservation.getStatus()
            );
            mailSender.send(adminMsg);
            log.info("Admin reservation notification emails sent");

            // Customer confirmation email
            SimpleMailMessage customerMsg = new SimpleMailMessage();
            customerMsg.setFrom(notificationSender);
            customerMsg.setTo(reservation.getEmail());
            customerMsg.setSubject("Your AURA reservation is confirmed");
            customerMsg.setText(
                "Hi " + reservation.getCustomerName() + ",\n\n" +
                "Your table has been reserved successfully. Here are the details:\n" +
                "Table: " + reservation.getTable().getTableNumber() + "\n" +
                "Date & Time: " + reservation.getReservationTime() + "\n" +
                "Party Size: " + reservation.getPartySize() + "\n\n" +
                "If you need to cancel or modify your reservation, please contact us at pdnprojectaura17@gmail.com.\n\n" +
                "Thank you,\nAURA Team"
            );
            mailSender.send(customerMsg);
            log.info("Customer confirmation email sent to {}", reservation.getEmail());
        } catch (Exception ex) {
            log.error("Failed to send reservation notification email", ex);
        }
    }
    
    // ── Check Slot Availability ──────────────────────────────────────────────
    
    @Override
    @Transactional(readOnly = true)
    public AvailabilityCheckResponse checkSlotAvailability(String date, String timeSlot) {
        LocalDateTime time = LocalDateTime.parse(date + "T" + timeSlot + ":00", DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        
        List<RestaurantTable> allTables = tableRepository.findAll();
        boolean anyAvailable = false;
        
        for (RestaurantTable table : allTables) {
            LocalDateTime windowStart = time.minusHours(SLOT_HOURS);
            LocalDateTime windowEnd   = time.plusHours(SLOT_HOURS);
            
            List<Reservation> conflicts = reservationRepository
                    .findConflictingReservations(table.getTableId(), windowStart, windowEnd);
                    
            if (conflicts.isEmpty()) {
                anyAvailable = true;
                break;
            }
        }
        
        return AvailabilityCheckResponse.builder()
                .available(anyAvailable)
                .message(anyAvailable ? "Table is available" : "No tables available at this time")
                .build();
    }

    // ── Cancel Reservation ───────────────────────────────────────────────────

    @Override
    @Transactional
    public ReservationResponse cancelReservation(Integer reservationId) {
        Reservation reservation = findOrThrow(reservationId);

        if ("CANCELLED".equals(reservation.getStatus())) {
            throw new IllegalStateException(
                    "Reservation " + reservationId + " is already cancelled.");
        }

        reservation.setStatus("CANCELLED");
        Reservation updated = reservationRepository.save(reservation);

        log.info("Reservation cancelled | id={}", reservationId);
        return mapToResponse(updated);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Reservation findOrThrow(Integer reservationId) {
        return reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Reservation not found: " + reservationId));
    }

    private ReservationResponse mapToResponse(Reservation r) {
        return ReservationResponse.builder()
                .reservationId(r.getReservationId())
                .tableId(r.getTable().getTableId())
                .tableNumber(r.getTable().getTableNumber())
                .tableCapacity(r.getTable().getCapacity())
                .customerName(r.getCustomerName())
                .email(r.getEmail())
                .phone(r.getPhone())
                .partySize(r.getPartySize())
                .reservationTime(r.getReservationTime())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .build();
    }
}