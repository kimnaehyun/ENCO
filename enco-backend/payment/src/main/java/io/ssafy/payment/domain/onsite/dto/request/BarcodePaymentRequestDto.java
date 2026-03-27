package io.ssafy.payment.domain.onsite.dto.request;

import java.math.BigDecimal;

public record BarcodePaymentRequestDto(
        String barcodeNumber,
        BigDecimal amount,
        String merchantName,
        Long cardId,
        Boolean usePoint
) {}
