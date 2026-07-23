package com.aura.system.controllers;

import com.aura.system.dtos.FeedbackSummaryResponse;
import com.aura.system.dtos.request.CreateFeedbackRequest;
import com.aura.system.entities.Feedback;
import com.aura.system.services.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<Feedback> submitFeedback(@RequestBody CreateFeedbackRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(feedbackService.submitFeedback(request));
    }

    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedback() {
        return ResponseEntity.ok(feedbackService.getAllFeedback());
    }

    @GetMapping("/summary")
    public ResponseEntity<FeedbackSummaryResponse> getSummary() {
        return ResponseEntity.ok(feedbackService.getSummary());
    }
}