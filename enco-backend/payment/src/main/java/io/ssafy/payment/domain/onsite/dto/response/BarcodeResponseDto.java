package io.ssafy.payment.domain.onsite.dto.response;

public record BarcodeResponseDto(
        String barcodeNumber,
        String qrData,
        String expiredAt
) {}