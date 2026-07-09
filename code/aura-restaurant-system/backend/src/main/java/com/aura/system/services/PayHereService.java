package com.aura.system.services;

import com.aura.system.dtos.request.PayHereDtos.InitPaymentRequest;
import com.aura.system.dtos.response.PayHereInitResponse;

import java.util.Map;

public interface PayHereService {
    PayHereInitResponse initiatePayment(InitPaymentRequest request);

    void handleNotification(Map<String, String> params);
}
