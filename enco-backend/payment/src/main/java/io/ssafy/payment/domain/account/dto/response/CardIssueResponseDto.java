package io.ssafy.payment.domain.account.dto.response;

import io.ssafy.payment.domain.card.entity.Card;

public record CardIssueResponseDto(
        Long cardId,
        String cardNumber,
        String frontImageUrl
) {
    public static CardIssueResponseDto from(Card card) {
        return new CardIssueResponseDto(
                card.getId(),
                card.getCardNumber(),
                card.getCardProduct().getFrontImageUrl()
        );
    }
}
