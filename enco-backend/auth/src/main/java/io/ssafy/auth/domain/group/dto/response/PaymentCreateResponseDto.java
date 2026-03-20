package io.ssafy.auth.domain.group.dto.response;

public record PaymentCreateResponseDto(
        Long accountId,
        String accountNumber,
        Long cardId
) {
}
