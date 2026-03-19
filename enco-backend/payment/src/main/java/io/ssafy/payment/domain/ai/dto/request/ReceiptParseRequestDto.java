package io.ssafy.payment.domain.ai.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ReceiptParseRequestDto(

        String ocrRawText,
        String normalizedText

) {
}
