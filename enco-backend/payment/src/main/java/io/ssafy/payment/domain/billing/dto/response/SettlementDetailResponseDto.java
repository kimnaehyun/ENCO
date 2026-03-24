package io.ssafy.payment.domain.billing.dto.response;

import io.ssafy.payment.domain.billing.entity.ChargeTarget;
import io.ssafy.payment.domain.billing.entity.ChargeTargetStatus;
import io.ssafy.payment.domain.billing.entity.Expense;
import io.ssafy.payment.domain.billing.entity.Receipt;
import io.ssafy.payment.domain.billing.entity.ReceiptItem;
import io.ssafy.payment.domain.billing.entity.ReceiptItemOption;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

public record SettlementDetailResponseDto(
        BigDecimal amount,
        String useCard,
        int paidCount,
        int totalCount,
        String status,
        String displayName,
        String transactionType,
        String memo,
        LocalDateTime paidAt,
        String receiptImageUrl,
        PaymentInfoDto paymentInfo
) {
    public record PaymentInfoDto(
            String merchantName,
            String address,
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

    public static SettlementDetailResponseDto of(Expense expense, List<ChargeTarget> targets, Receipt receipt) {
        int paidCount = (int) targets.stream()
                .filter(t -> t.getStatus() == ChargeTargetStatus.PAID)
                .count();

        BigDecimal amount = targets.isEmpty() ? BigDecimal.ZERO : targets.get(0).getAmount();

        PaymentInfoDto paymentInfo = null;
        if (receipt != null) {
            List<ItemDto> itemDtos = receipt.getItems() == null ? Collections.emptyList()
                    : receipt.getItems().stream()
                            .map(item -> new ItemDto(
                                    item.getName(),
                                    item.getUnitPrice(),
                                    item.getQuantity() != null ? item.getQuantity() : 0,
                                    item.getAmount(),
                                    item.getOptions() == null ? Collections.emptyList()
                                            : item.getOptions().stream()
                                                    .map(opt -> new OptionDto(
                                                            opt.getName(),
                                                            opt.getUnitPrice(),
                                                            opt.getQuantity() != null ? opt.getQuantity() : 0,
                                                            opt.getAmount()
                                                    ))
                                                    .toList()
                            ))
                            .toList();

            paymentInfo = new PaymentInfoDto(
                    receipt.getMerchantName(),
                    receipt.getAddress(),
                    receipt.getPaidAt(),
                    itemDtos,
                    receipt.getTotalAmount(),
                    receipt.getBusinessNumber()
            );
        }

        return new SettlementDetailResponseDto(
                amount,
                "총무개인카드",
                paidCount,
                targets.size(),
                expense.getStatus().name(),
                expense.getMerchantName(),
                "정산",
                expense.getMemo(),
                expense.getPaidAt(),
                expense.getReceiptUrl(),
                paymentInfo
        );
    }
}
