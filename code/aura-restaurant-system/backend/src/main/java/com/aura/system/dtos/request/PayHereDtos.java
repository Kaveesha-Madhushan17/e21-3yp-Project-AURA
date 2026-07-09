package com.aura.system.dtos.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class PayHereDtos {
    public record InitPaymentRequest(
            @NotNull(message = "Table ID is required")
            Integer tableId,

            String tableNumber,

            @NotNull(message = "Session ID is required")
            Long sessionId,

            @NotNull(message = "Amount is required")
            @Positive(message = "Amount must be positive")
            Float amount
    ) {}
}
