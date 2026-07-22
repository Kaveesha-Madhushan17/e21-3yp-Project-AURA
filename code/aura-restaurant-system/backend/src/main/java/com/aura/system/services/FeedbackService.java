package com.aura.system.services;

import com.aura.system.dtos.FeedbackSummaryResponse;
import com.aura.system.dtos.request.CreateFeedbackRequest;
import com.aura.system.entities.Feedback;

import java.util.List;

public interface FeedbackService {
    Feedback submitFeedback(CreateFeedbackRequest request);
    List<Feedback> getAllFeedback();
    FeedbackSummaryResponse getSummary();
}