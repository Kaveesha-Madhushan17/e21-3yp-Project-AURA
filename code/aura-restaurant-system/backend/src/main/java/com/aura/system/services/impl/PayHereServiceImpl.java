package com.aura.system.services.impl;

import com.aura.system.dtos.request.PayHereDtos.InitPaymentRequest;
import com.aura.system.dtos.response.PayHereInitResponse;
import com.aura.system.services.PayHereService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;

@Service
public class PayHereServiceImpl implements PayHereService {

    private static final Logger log = LoggerFactory.getLogger(PayHereServiceImpl.class);
    private static final String CURRENCY = "LKR";

    @Value("${payhere.merchant-id}")
    private String merchantId;

    @Value("${payhere.merchant-secret}")
    private String merchantSecret;

    @Value("${payhere.sandbox}")
    private boolean sandbox;

    @Value("${payhere.app-base-url}")
    private String appBaseUrl;

    @Override
    public PayHereInitResponse initiatePayment(InitPaymentRequest request) {
        String orderId = "AURA-T" + request.tableId() + "-" + request.sessionId() + "-" + System.currentTimeMillis();
        String amountFormatted = String.format("%.2f", request.amount());
        String hashedSecret = md5(merchantSecret).toUpperCase();
        String hash = md5(merchantId + orderId + amountFormatted + CURRENCY + hashedSecret).toUpperCase();

        log.info("PayHere payment initiated: orderId={}, tableId={}, amount={}",
                orderId, request.tableId(), amountFormatted);

        return new PayHereInitResponse(
                merchantId,
                orderId,
                amountFormatted,
                CURRENCY,
                hash,
                sandbox,
                appBaseUrl + "/api/payments/payhere/notify"
        );
    }

    @Override
    public void handleNotification(Map<String, String> params) {
        // Best-effort IPN handler. PayHere's servers can't reach this while the
        // backend runs on localhost, so this only fires once deployed behind a
        // public URL. Kept here so nothing else needs to change at that point.
        String merchantSig    = params.get("md5sig");
        String orderId        = params.get("order_id");
        String statusCode     = params.get("status_code");
        String payhereAmount  = params.get("payhere_amount");
        String payhereCurrency = params.get("payhere_currency");

        String expected = md5(
                merchantId + orderId + payhereAmount + payhereCurrency + statusCode + md5(merchantSecret).toUpperCase()
        ).toUpperCase();

        if (!expected.equals(merchantSig)) {
            log.warn("PayHere IPN signature mismatch for order {}", orderId);
            return;
        }
        log.info("PayHere IPN verified for order {} — status {}", orderId, statusCode);
    }

    private String md5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) sb.append(String.format("%02X", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}
