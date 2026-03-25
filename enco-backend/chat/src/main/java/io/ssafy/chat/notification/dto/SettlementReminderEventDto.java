package io.ssafy.chat.notification.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SettlementReminderEventDto(
        String notificationId,
        String type,
        String title,
        String content,
        Long groupId,
        Long chargeTargetId,
        BigDecimal amount,
        LocalDateTime createdAt
) {}
