package io.ssafy.payment.domain.card.dto.response;

import io.ssafy.payment.domain.card.entity.CardProduct;
import java.math.BigDecimal;
import java.util.List;

public record CardProductDetailResponseDto(
        Long id,
        String name,
        BigDecimal baseSpending,
        BigDecimal maxBenefitLimit,
        String description,
        BigDecimal maxLimit,
        String frontImageUrl,
        String backImageUrl,
        List<String> categories
) {
    public static CardProductDetailResponseDto from(CardProduct card) {
        return new CardProductDetailResponseDto(
                card.getId(),
                card.getName(),
                card.getBaseSpending(),
                card.getMaxBenefitLimit(),
                card.getDescription(),
                card.getMaxLimit(),
                card.getFrontImageUrl(),
                card.getBackImageUrl(),
                card.getCardBenefitList().stream()
                        .map(benefit -> benefit.getCategory().getName())
                        .toList()
        );
    }
}