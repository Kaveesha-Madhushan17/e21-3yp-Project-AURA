package com.aura.system.services;

import com.aura.system.dtos.response.ReservationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${aura.notifications.sender:pdnprojectaura17@gmail.com}")
    private String notificationSender;

    @Async
    public void sendReservationConfirmation(ReservationResponse reservation) {
        try {
            // Admin notification to multiple addresses
            SimpleMailMessage adminMsg = new SimpleMailMessage();
            adminMsg.setFrom(notificationSender);
            adminMsg.setTo(new String[]{"pdnprojectaura17@gmail.com", "kaveeshamadhushan1776@gmail.com"});
            adminMsg.setSubject("New AURA Reservation: " + reservation.getCustomerName());
            adminMsg.setText(
                "New reservation details:\n\n" +
                "Customer Name: " + reservation.getCustomerName() + "\n" +
                "Customer Email: " + reservation.getEmail() + "\n" +
                "Customer Phone: " + reservation.getPhone() + "\n" +
                "Selected Table: " + reservation.getTableNumber() + "\n" +
                "Reservation Time: " + reservation.getReservationTime() + "\n" +
                "Party Size: " + reservation.getPartySize() + "\n" +
                "Status: " + reservation.getStatus()
            );
            mailSender.send(adminMsg);
            log.info("Admin reservation notification emails sent successfully for reservation time {}", reservation.getReservationTime());

            // Customer confirmation email
            SimpleMailMessage customerMsg = new SimpleMailMessage();
            customerMsg.setFrom(notificationSender);
            customerMsg.setTo(reservation.getEmail());
            customerMsg.setSubject("Your AURA reservation is confirmed");
            customerMsg.setText(
                "Hi " + reservation.getCustomerName() + ",\n\n" +
                "Your table has been reserved successfully. Here are the details:\n" +
                "Table: " + reservation.getTableNumber() + "\n" +
                "Date & Time: " + reservation.getReservationTime() + "\n" +
                "Party Size: " + reservation.getPartySize() + "\n\n" +
                "If you need to cancel or modify your reservation, please contact us at pdnprojectaura17@gmail.com.\n\n" +
                "Thank you,\nAURA Team"
            );
            mailSender.send(customerMsg);
            log.info("Customer confirmation email sent successfully to {}", reservation.getEmail());
        } catch (Exception ex) {
            log.error("Failed to send reservation notification email. Continuing without failure.", ex);
        }
    }
}
