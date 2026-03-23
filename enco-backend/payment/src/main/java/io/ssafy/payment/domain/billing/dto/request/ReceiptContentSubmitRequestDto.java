package io.ssafy.payment.domain.billing.dto.request;

import io.ssafy.payment.domain.billing.dto.response.ReceiptOcrDraftResponseDto;

public record ReceiptContentSubmitRequestDto(
        Long groupId,
        String evidenceId,
        ReceiptOcrDraftResponseDto receipt
) {
}