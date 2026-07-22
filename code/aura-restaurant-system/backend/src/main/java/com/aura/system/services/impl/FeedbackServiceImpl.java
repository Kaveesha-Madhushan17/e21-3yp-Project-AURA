package com.aura.system.services.impl;

import com.aura.system.dtos.FeedbackSummaryResponse;
import com.aura.system.dtos.request.CreateFeedbackRequest;
import com.aura.system.entities.Feedback;
import com.aura.system.entities.Order;
import com.aura.system.repositories.FeedbackRepository;
import com.aura.system.repositories.OrderRepository;
import com.aura.system.services.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional
    public Feedback submitFeedback(CreateFeedbackRequest request) {
        if (request.rating() == null || request.rating() < 1 || request.rating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Order not found with ID: " + request.orderId()));

        Feedback feedback = Feedback.builder()
                .order(order)
                .rating(request.rating())
                .feedbackTime(LocalDateTime.now())
                .build();

        return feedbackRepository.save(feedback);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Feedback> getAllFeedback() {
        List<Feedback> all = feedbackRepository.findAll();
        all.forEach(f -> {
            // force-initialize lazy order (and its table) while session is open
            f.getOrder().getOrderId();
            if (f.getOrder().getTable() != null) {
                f.getOrder().getTable().getTableId();
            }
        });
        all.sort((a, b) -> b.getFeedbackTime().compareTo(a.getFeedbackTime()));
        return all;
    }

    @Override
    @Transactional(readOnly = true)
    public FeedbackSummaryResponse getSummary() {
        Double avg = feedbackRepository.findAverageRating();
        long count = feedbackRepository.count();
        return new FeedbackSummaryResponse(avg != null ? avg : 0.0, count);
    }
}