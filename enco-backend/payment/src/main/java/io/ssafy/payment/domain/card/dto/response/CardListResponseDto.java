package io.ssafy.payment.domain.card.dto.response;

import io.ssafy.payment.domain.card.entity.Card;

public record CardListResponseDto(
        Long cardId,
        String frontCardImageUrl,
        String cardName,
        String backCardImageUrl,
        Boolean isBasic
) {
    public static CardListResponseDto from(Card card) {
        return new CardListResponseDto(
                card.getId(),
                card.getCardProduct().getFrontImageUrl(),
                card.getCardProduct().getName(),
                card.getCardProduct().getBackImageUrl(),
                card.getIsBasic()
        );
    }
}