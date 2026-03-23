package io.ssafy.payment.domain.billing.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ReceiptOcrDraftResponseDto(
        String merchantName,
        String address,
        String paidAt,
        String businessNumber,
        BigDecimal totalAmount,
        List<ItemDto> items,
        Map<String, List<Object>> candidates,
        OcrMetaDto ocrMeta
) {
    public record ItemDto(
            String name,
            BigDecimal unitPrice,
            Integer quantity,
            BigDecimal amount,
            List<OptionDto> options
    ) {
    }

    public record OptionDto(
            String name,
            BigDecimal unitPrice,
            Integer quantity,
            BigDecimal amount
    ) {
    }

    public record OcrMetaDto(
            String provider,
            String requestId,
            String inferResult
    ) {
    }
}