package io.ssafy.payment.domain.billing.dto.response;

public record ReceiptContentSubmitResponseDto(
        Long groupId,
        String evidenceId,
        ReceiptOcrDraftResponseDto receipt,
        boolean accepted
) {
}