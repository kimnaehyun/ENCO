package io.ssafy.payment.domain.transaction.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonRawValue;
import io.ssafy.payment.domain.transaction.entity.TransactionHistory;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionDetailResponseDto(
        String displayName,
        BigDecimal amount,
        LocalDateTime transactionDate,
        String type,
        String cardName,
        BigDecimal balanceAfter,
        String memo,
        @JsonInclude(JsonInclude.Include.NON_NULL) ReceiptDto receipt
) {
    public record ReceiptDto(
            String receiptImageUrl,
            @JsonRawValue @JsonInclude(JsonInclude.Include.NON_NULL) String receiptContent
    ) {}

    public static TransactionDetailResponseDto of(TransactionHistory th, String cardName) {
        ReceiptDto receipt = (th.getReceiptUrl() != null || th.getReceiptContent() != null)
                ? new ReceiptDto(th.getReceiptUrl(), th.getReceiptContent())
                : null;

        return new TransactionDetailResponseDto(
                th.getDisplayName(),
                th.getAmount(),
                th.getCreatedAt(),
                th.getType().name(),
                cardName,
                th.getBalance(),
                th.getMemo(),
                receipt
        );
    }
}
