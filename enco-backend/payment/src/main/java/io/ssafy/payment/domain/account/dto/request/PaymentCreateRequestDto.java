package io.ssafy.payment.domain.account.dto.request;

public record PaymentCreateRequestDto(
        Long userId,
        Long groupId,
        String password,
        Long cardProductId
) {}
