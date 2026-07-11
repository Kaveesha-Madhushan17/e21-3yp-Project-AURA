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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository    reservationRepository;
    private final RestaurantTableRepository tableRepository;

    // A reservation blocks the table for 2 hours either side
    private static final int SLOT_HOURS = 2;

    // ── Create Reservation ───────────────────────────────────────────────────

    @Override
    @Transactional
    public ReservationResponse createReservation(CreateReservationRequest request) {

        // 1. Find an available table that fits the party size
        List<RestaurantTable> tables = tableRepository.findAll();
        
        RestaurantTable assignedTable = null;
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
            throw new IllegalStateException("No available table found for that time and party size.");
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

        // TODO: Email sending logic here

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
    public SlotAvailabilityResponse getAvailableSlots(String dateStr) {
        LocalDate date = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
        
        List<SlotAvailabilityResponse.SlotInfo> slots = new ArrayList<>();
        List<RestaurantTable> allTables = tableRepository.findAll();
        
        // Define restaurant hours (e.g. 17:00 to 22:00)
        for (int hour = 17; hour <= 22; hour++) {
            LocalDateTime slotTime = LocalDateTime.of(date, LocalTime.of(hour, 0));
            
            boolean anyTableAvailable = false;
            for (RestaurantTable table : allTables) {
                LocalDateTime windowStart = slotTime.minusHours(SLOT_HOURS);
                LocalDateTime windowEnd   = slotTime.plusHours(SLOT_HOURS);
                
                List<Reservation> conflicts = reservationRepository
                        .findConflictingReservations(table.getTableId(), windowStart, windowEnd);
                        
                if (conflicts.isEmpty()) {
                    anyTableAvailable = true;
                    break;
                }
            }
            
            slots.add(SlotAvailabilityResponse.SlotInfo.builder()
                    .time(String.format("%02d:00", hour))
                    .available(anyTableAvailable)
                    .build());
        }
        
        return SlotAvailabilityResponse.builder()
                .date(dateStr)
                .slots(slots)
                .build();
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