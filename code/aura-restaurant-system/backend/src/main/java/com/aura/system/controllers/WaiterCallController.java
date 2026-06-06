package com.aura.system.controllers;

import com.aura.system.mqtt.MqttPublisher;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/waiter")
@RequiredArgsConstructor
@Slf4j
public class WaiterCallController {

    private final MqttPublisher mqttPublisher;
    private final ObjectMapper objectMapper;

    // POST /api/waiter/call
    @PostMapping("/call")
    public ResponseEntity<Map<String, String>> callWaiter(
            @RequestBody Map<String, Object> request) {
        try {
            int tableId = (int) request.get("tableId");
            String tableNumber = (String) request.get("tableNumber");
            String message = (String) request.getOrDefault("message", "Customer needs assistance");

            // MQTT payload හදනවා
            Map<String, Object> payload = Map.of(
                "tableId",     tableId,
                "tableNumber", tableNumber,
                "message",     message,
                "timestamp",   Instant.now().toString()
            );

            String topic   = "aura/table/" + tableId + "/call-waiter";
            String payloadJson = objectMapper.writeValueAsString(payload);

            mqttPublisher.publish(topic, payloadJson);

            log.info("Waiter called from table {} (tableId={})", tableNumber, tableId);

            return ResponseEntity.ok(Map.of(
                "status",  "sent",
                "message", "Waiter has been notified"
            ));

        } catch (Exception e) {
            log.error("Failed to publish waiter call: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}