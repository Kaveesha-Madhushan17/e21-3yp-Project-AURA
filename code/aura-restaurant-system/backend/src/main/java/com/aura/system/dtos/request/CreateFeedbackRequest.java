package com.aura.system.dtos.request;

public record CreateFeedbackRequest(
        Integer orderId,
        Integer rating
) {}
