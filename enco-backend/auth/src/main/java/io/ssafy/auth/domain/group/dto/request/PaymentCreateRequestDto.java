package io.ssafy.auth.domain.group.dto.request;

public record PaymentCreateRequestDto(
        Long userId,
        Long groupId,
        String password,
        Long cardProductId
) {}
