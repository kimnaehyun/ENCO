package io.ssafy.payment.domain.billing.dto.response;

import java.time.LocalDateTime;

public record ReminderResponseDto(
        Long chargeId,
        int requestedCount,
        int sentCount,
        int failedCount,
        LocalDateTime sentAt
) {}
