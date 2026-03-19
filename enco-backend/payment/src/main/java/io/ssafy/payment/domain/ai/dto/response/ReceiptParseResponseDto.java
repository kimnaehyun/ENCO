package io.ssafy.payment.domain.ai.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record ReceiptParseResponseDto(
        String merchantName,
        String address,
        String paidAt,
        List<ItemDto> items,
        BigDecimal totalAmount,
        String businessNumber
) {
    public record ItemDto(
            String name,
            BigDecimal unitPrice,
            int quantity,
            BigDecimal amount,
            List<OptionDto> options
    ) {
    }

    public record OptionDto(
            String name,
            BigDecimal unitPrice,
            int quantity,
            BigDecimal amount
    ) {
    }
}
