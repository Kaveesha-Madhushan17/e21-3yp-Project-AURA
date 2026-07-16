package com.aura.system.controllers;

import com.aura.system.mqtt.MqttPublisher;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Assigned to: E/21/407 Thennakoon
 * Module: Waiter Call & Walk-in Session
 * Function under test: WaiterCallController.callWaiter(Map<String,Object>)
 */
@ExtendWith(MockitoExtension.class)
class WaiterCallControllerTest {

    @Mock private MqttPublisher mqttPublisher;

    private WaiterCallController controller;

    @BeforeEach
    void setUp() {
        controller = new WaiterCallController(mqttPublisher, new ObjectMapper());
    }

    // ── EP1: complete valid request ──────────────────────────────────────────
    @Test
    @DisplayName("EP1: complete valid request -> 200 OK, custom message published")
    void callWaiter_withValidRequest_returnsOkAndPublishes() {
        Map<String, Object> request = new HashMap<>();
        request.put("tableId", 5);
        request.put("tableNumber", "5");
        request.put("message", "Need water");

        ResponseEntity<Map<String, String>> response = controller.callWaiter(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("status", "sent");

        ArgumentCaptor<String> payloadCaptor = ArgumentCaptor.forClass(String.class);
        verify(mqttPublisher).publish(eq("aura/table/5/call-waiter"), payloadCaptor.capture());
        assertThat(payloadCaptor.getValue()).contains("Need water");
    }

    // ── EP2: valid request without "message" -> default message used ────────
    @Test
    @DisplayName("EP2: no message key -> default 'Customer needs assistance' is published")
    void callWaiter_withoutMessageKey_usesDefaultMessage() {
        Map<String, Object> request = new HashMap<>();
        request.put("tableId", 5);
        request.put("tableNumber", "5");

        ResponseEntity<Map<String, String>> response = controller.callWaiter(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        ArgumentCaptor<String> payloadCaptor = ArgumentCaptor.forClass(String.class);
        verify(mqttPublisher).publish(anyString(), payloadCaptor.capture());
        assertThat(payloadCaptor.getValue()).contains("Customer needs assistance");
    }

    // ── EP3 (type mismatch): tableId sent as String -> 500, not 400 ─────────
    @Test
    @DisplayName("EP3/gap: tableId as String -> ClassCastException caught, returns 500 instead of 400")
    void callWaiter_withStringTableId_returnsInternalServerError() {
        Map<String, Object> request = new HashMap<>();
        request.put("tableId", "5");
        request.put("tableNumber", "5");

        ResponseEntity<Map<String, String>> response = controller.callWaiter(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).containsEntry("status", "error");
        verify(mqttPublisher, never()).publish(anyString(), anyString());
    }

    // ── EP4: tableId missing entirely -> NPE on unboxing -> 500 ──────────────
    @Test
    @DisplayName("EP4: missing tableId -> NullPointerException caught, returns 500")
    void callWaiter_withMissingTableId_returnsInternalServerError() {
        Map<String, Object> request = new HashMap<>();
        request.put("tableNumber", "5");

        ResponseEntity<Map<String, String>> response = controller.callWaiter(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // ── EP5 (real bug, confirmed by running this test): missing tableNumber ──
    // Map.of() rejects null values, so building the MQTT payload throws NPE.
    // That NPE IS caught by catch(Exception e) -- but the catch block then
    // calls Map.of("message", e.getMessage()), and e.getMessage() is null for
    // this particular NPE, so Map.of() throws a SECOND, uncaught NPE. The
    // request never gets any HTTP response at all -- worse than a clean 500.
    @Test
    @DisplayName("EP5/bug: missing tableNumber -> cascading NPE, no HTTP response is ever returned")
    void callWaiter_withMissingTableNumber_throwsUncaughtNullPointerException() {
        Map<String, Object> request = new HashMap<>();
        request.put("tableId", 5);

        assertThatThrownBy(() -> controller.callWaiter(request))
                .isInstanceOf(NullPointerException.class);

        verify(mqttPublisher, never()).publish(anyString(), anyString());
    }

    // ── Boundary (type): tableId as Long (large number) -> ClassCastException
    @Test
    @DisplayName("Boundary: tableId as Long -> ClassCastException caught, returns 500")
    void callWaiter_withTableIdAsLong_returnsInternalServerError() {
        Map<String, Object> request = new HashMap<>();
        request.put("tableId", 5_000_000_000L);
        request.put("tableNumber", "5");

        ResponseEntity<Map<String, String>> response = controller.callWaiter(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // ── Boundary (type): tableId as Double (decimal) -> ClassCastException ──
    @Test
    @DisplayName("Boundary: tableId as Double -> ClassCastException caught, returns 500")
    void callWaiter_withTableIdAsDouble_returnsInternalServerError() {
        Map<String, Object> request = new HashMap<>();
        request.put("tableId", 5.0);
        request.put("tableNumber", "5");

        ResponseEntity<Map<String, String>> response = controller.callWaiter(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // ── Error/negative: completely empty request body -> 500 ────────────────
    @Test
    @DisplayName("Error case: empty request map -> 500")
    void callWaiter_withEmptyRequestBody_returnsInternalServerError() {
        ResponseEntity<Map<String, String>> response = controller.callWaiter(new HashMap<>());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // ── Error/negative: MQTT broker unreachable -> 500 ───────────────────────
    @Test
    @DisplayName("Error case: MQTT publish throws -> 500, waiter call reported as failed")
    void callWaiter_whenMqttPublishThrows_returnsInternalServerError() {
        Map<String, Object> request = new HashMap<>();
        request.put("tableId", 5);
        request.put("tableNumber", "5");
        doThrow(new RuntimeException("Broker unreachable")).when(mqttPublisher).publish(anyString(), anyString());

        ResponseEntity<Map<String, String>> response = controller.callWaiter(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).containsEntry("message", "Broker unreachable");
    }
}
