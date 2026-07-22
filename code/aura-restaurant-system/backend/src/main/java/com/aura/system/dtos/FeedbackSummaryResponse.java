package com.aura.system.dtos;

public record FeedbackSummaryResponse(
        Double averageRating,
        Long totalCount
) {}