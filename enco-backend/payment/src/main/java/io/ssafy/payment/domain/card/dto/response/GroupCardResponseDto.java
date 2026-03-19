package io.ssafy.payment.domain.card.dto.response;

import io.ssafy.payment.domain.card.entity.Card;

public record GroupCardResponseDto(
        Long cardId,
        String cardName,
        String frontCardImageUrl,
        String backCardImageUrl,
        Boolean isBasic
) {
    public static GroupCardResponseDto from(Card card) {
        return new GroupCardResponseDto(
                card.getId(),
                card.getCardProduct().getName(),
                card.getCardProduct().getFrontImageUrl(),
                card.getCardProduct().getBackImageUrl(),
                card.getIsBasic()
        );
    }
}
