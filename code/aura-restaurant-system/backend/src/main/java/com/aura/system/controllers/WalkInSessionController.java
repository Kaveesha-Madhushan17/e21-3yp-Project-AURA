package com.aura.system.controllers;

import com.aura.system.entities.WalkInSession;
import com.aura.system.repositories.WalkInSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/walk-in-sessions")
@RequiredArgsConstructor
public class WalkInSessionController {

    private final WalkInSessionRepository walkInSessionRepository;

    // POST /api/walk-in-sessions?tableId=1
    @PostMapping
    public ResponseEntity<Map<String, Long>> createSession(
            @RequestParam Integer tableId) {

        WalkInSession session = WalkInSession.builder()
                .tableId(tableId)
                .build();

        WalkInSession saved = walkInSessionRepository.save(session);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of("sessionId", saved.getSessionId()));
    }
}