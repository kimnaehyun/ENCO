package io.ssafy.payment.domain.transaction.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.ssafy.payment.domain.billing.entity.Receipt;
import io.ssafy.payment.domain.billing.entity.ReceiptItem;
import io.ssafy.payment.domain.billing.entity.ReceiptItemOption;
import io.ssafy.payment.domain.transaction.entity.TransactionHistory;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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
            @JsonInclude(JsonInclude.Include.NON_NULL) ReceiptContentDto receiptContent
    ) {}

    public record ReceiptContentDto(
            String merchantName,
            String address,
            LocalDateTime paidAt,
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
        ) {}

        public record OptionDto(
                String name,
                BigDecimal unitPrice,
                int quantity,
                BigDecimal amount
        ) {}
    }

    public static TransactionDetailResponseDto of(TransactionHistory th, String cardName, Receipt receipt) {
        ReceiptDto receiptDto = null;
        String receiptUrl = th.getReceiptUrl();

        if (receiptUrl != null || receipt != null) {
            ReceiptContentDto contentDto = null;
            if (receipt != null) {
                List<ReceiptContentDto.ItemDto> items = receipt.getItems().stream()
                        .map(item -> new ReceiptContentDto.ItemDto(
                                item.getName(),
                                item.getUnitPrice(),
                                item.getQuantity(),
                                item.getAmount(),
                                item.getOptions().stream()
                                        .map(opt -> new ReceiptContentDto.OptionDto(
                                                opt.getName(),
                                                opt.getUnitPrice(),
                                                opt.getQuantity(),
                                                opt.getAmount()
                                        )).toList()
                        )).toList();

                contentDto = new ReceiptContentDto(
                        receipt.getMerchantName(),
                        receipt.getAddress(),
                        receipt.getPaidAt(),
                        items,
                        receipt.getTotalAmount(),
                        receipt.getBusinessNumber()
                );
            }
            receiptDto = new ReceiptDto(receiptUrl, contentDto);
        }

        return new TransactionDetailResponseDto(
                th.getDisplayName(),
                th.getAmount(),
                th.getCreatedAt(),
                th.getType().name(),
                cardName,
                th.getBalance(),
                th.getMemo(),
                receiptDto
        );
    }
}
