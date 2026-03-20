package io.ssafy.auth.infra.client;

public record PaymentCreateResponseDto(
    Long accountId,
    String accountNumber,
    Long cardId
) {
    public static PaymentCreateResponseDto of(Long accountId, String accountNumber, Long cardId) {
        return new PaymentCreateResponseDto(accountId, accountNumber, cardId);
    }
}
