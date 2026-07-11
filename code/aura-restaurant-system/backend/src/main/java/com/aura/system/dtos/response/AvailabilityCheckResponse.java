package com.aura.system.dtos.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AvailabilityCheckResponse {
    private boolean available;
    private String message;
}
