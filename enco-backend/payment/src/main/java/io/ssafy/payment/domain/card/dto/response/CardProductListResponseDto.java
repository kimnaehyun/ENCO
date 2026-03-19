package io.ssafy.payment.domain.card.dto.response;

import io.ssafy.payment.domain.card.entity.CardProduct;
import java.math.BigDecimal;
import java.util.List;

public record CardProductListResponseDto(
        Long id,
        String name,
        String frontImageUrl,
        String backImageUrl,
        BigDecimal baseSpending,
        BigDecimal maxBenefitLimit,
        List<CardBenefitResponseDto> benefits
) {
    public static CardProductListResponseDto from(CardProduct card) {
        return new CardProductListResponseDto(
                card.getId(),
                card.getName(),
                card.getFrontImageUrl(),
                card.getBackImageUrl(),
                card.getBaseSpending(),
                card.getMaxBenefitLimit(),
                card.getCardBenefitList().stream()
                        .map(CardBenefitResponseDto::from)
                        .toList()
        );
    }
}