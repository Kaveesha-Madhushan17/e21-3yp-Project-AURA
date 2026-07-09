package com.aura.system.controllers;

import com.aura.system.dtos.request.PayHereDtos.InitPaymentRequest;
import com.aura.system.dtos.response.PayHereInitResponse;
import com.aura.system.services.PayHereService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/payhere")
@RequiredArgsConstructor
public class PayHereController {

    private final PayHereService payHereService;

    // POST /api/payments/payhere/init
    @PostMapping("/init")
    public ResponseEntity<PayHereInitResponse> initPayment(
            @Valid @RequestBody InitPaymentRequest request) {
        return ResponseEntity.ok(payHereService.initiatePayment(request));
    }

    // POST /api/payments/payhere/notify — PayHere server-to-server IPN (form-encoded)
    @PostMapping("/notify")
    public ResponseEntity<String> notify(@RequestParam Map<String, String> params) {
        payHereService.handleNotification(params);
        return ResponseEntity.ok("OK");
    }
}
