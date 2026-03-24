package io.ssafy.payment.domain.billing.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record CreateExpenseRequestDto(
        BigDecimal amount,
        String receiverAccountNumber,
        String receiverBankName,
        PaymentInfoDto paymentInfo,
        String displayName,
        String memo,
        List<Long> participants
) {
    public record PaymentInfoDto(
            String merchantName,
            String address,
            @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
            LocalDateTime paidAt,
            List<ItemDto> items,
            BigDecimal totalAmount,
            String businessNumber
    ) {}

    public record ItemDto(
            String name,
            BigDecimal unitPrice,
            int quantity,
            BigDecimal amount,
            List<OptionDto> options
    ) {}

    public record OptionDto(
            String name,
            BigDecimal unitPrice,
            int quantity,
            BigDecimal amount
    ) {}
}
