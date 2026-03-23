package io.ssafy.payment.domain.vote.dto.request;

import java.math.BigDecimal;

public record PaymentVoteCreateRequestDto(
        String transactionId,
        Long groupId,
        Long cardId,
        String password,
        String title,
        BigDecimal amount,
        int totalMembers
) {}
