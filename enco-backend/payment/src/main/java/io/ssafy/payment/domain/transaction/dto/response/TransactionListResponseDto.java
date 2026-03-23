package io.ssafy.payment.domain.transaction.dto.response;

import io.ssafy.payment.domain.billing.entity.Expense;
import io.ssafy.payment.domain.transaction.entity.Direction;
import io.ssafy.payment.domain.transaction.entity.TransactionHistory;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record TransactionListResponseDto(
        List<ItemDto> items,
        Long nextCursor,
        boolean hasNext
) {
    public record ItemDto(
            String referenceType,
            Long referenceId,
            LocalDateTime transactionDate,
            String title,
            String type,
            BigDecimal amount,
            BigDecimal balanceAfter
    ) {
        public static ItemDto fromTransaction(TransactionHistory th) {
            String directionType = th.getDirection() == Direction.IN ? "DEPOSIT" : "WITHDRAW";
            return new ItemDto(
                    "TRANSACTION",
                    th.getId(),
                    th.getCreatedAt(),
                    th.getDisplayName(),
                    directionType,
                    th.getAmount(),
                    th.getBalance()
            );
        }

        public static ItemDto fromExpense(Expense expense, BigDecimal currentBalance) {
            return new ItemDto(
                    "EXPENSE",
                    expense.getId(),
                    expense.getCreatedAt(),
                    expense.getMerchantName(),
                    "WITHDRAW",
                    expense.getTotalAmount(),
                    currentBalance
            );
        }
    }
}
