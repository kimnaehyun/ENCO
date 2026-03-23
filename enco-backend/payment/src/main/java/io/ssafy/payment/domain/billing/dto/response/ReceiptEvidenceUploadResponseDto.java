package io.ssafy.payment.domain.billing.dto.response;

public record ReceiptEvidenceUploadResponseDto(
        String evidenceId,
        String receiptImageUrl,
        String source,
        Long groupId
) {
}