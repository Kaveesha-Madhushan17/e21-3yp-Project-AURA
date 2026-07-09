package com.aura.system.dtos.response;

public record PayHereInitResponse(
        String merchantId,
        String orderId,
        String amount,
        String currency,
        String hash,
        boolean sandbox,
        String notifyUrl
) {}
