package io.ssafy.payment.domain.onsite.dto.response;

public record LocationResponseDto(
        int nearbyMemberCount,
        int totalMemberCount,
        BarcodeResponseDto barcode
) {}
