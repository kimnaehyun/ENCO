package io.ssafy.payment.domain.card.dto.response;

import io.ssafy.payment.domain.card.entity.CardBenefit;
import java.math.BigDecimal;

public record CardBenefitResponseDto(
        String categoryName,
        BigDecimal discountRate
) {
    public static CardBenefitResponseDto from(CardBenefit benefit) {
        return new CardBenefitResponseDto(
                benefit.getCategory().getName(),
                benefit.getDiscountRate()
        );
    }
}