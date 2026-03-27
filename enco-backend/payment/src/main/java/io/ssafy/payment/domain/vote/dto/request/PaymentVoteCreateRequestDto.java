package io.ssafy.payment.domain.vote.dto.request;

import java.math.BigDecimal;

public record PaymentVoteCreateRequestDto(
        Long groupId,
        Long cardId,
        String counterpartyBankName,
        String counterpartyName,
        String counterpartyBankAccountNumber,
        String password,
        String title,
        String description,
        BigDecimal amount,
        Boolean usePoint
) {}
