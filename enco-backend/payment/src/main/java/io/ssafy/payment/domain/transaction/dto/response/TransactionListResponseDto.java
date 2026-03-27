package io.ssafy.payment.domain.transaction.dto.response;

import io.ssafy.payment.domain.billing.entity.Expense;
import io.ssafy.payment.domain.billing.entity.ExpenseStatus;
import io.ssafy.payment.domain.transaction.entity.Direction;
import io.ssafy.payment.domain.transaction.entity.TransactionHistory;
import io.ssafy.payment.infra.client.AuthServiceClient.PointHistoryResponse;

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
            BigDecimal balanceAfter,
            String status
    ) {
        public static ItemDto fromTransaction(TransactionHistory th) {
            String directionType = th.getDirection() == Direction.IN ? "DEPOSIT" : "WITHDRAW";
            String status = switch (th.getStatus()) {
                case APPROVED -> "APPROVED";
                case REJECTED, CANCELED -> "CANCELED";
                default -> "PENDING";
            };
            return new ItemDto(
                    "TRANSACTION",
                    th.getId(),
                    th.getCreatedAt(),
                    th.getDisplayName(),
                    directionType,
                    th.getAmount(),
                    th.getBalance(),
                    status
            );
        }

        public static ItemDto fromExpense(Expense expense, BigDecimal currentBalance) {
            String status = expense.getStatus() == ExpenseStatus.COMPLETED ? "APPROVED" : "PENDING";
            return new ItemDto(
                    "EXPENSE",
                    expense.getId(),
                    expense.getCreatedAt(),
                    expense.getMerchantName(),
                    "WITHDRAW",
                    expense.getTotalAmount(),
                    currentBalance,
                    status
            );
        }

        public static ItemDto fromPointHistory(PointHistoryResponse p) {
            String type = "IN".equals(p.direction()) ? "DEPOSIT" : "WITHDRAW";
            return new ItemDto(
                    "POINT",
                    p.id(),
                    p.createdAt(),
                    p.description(),
                    type,
                    p.amount(),
                    p.balance(),
                    "APPROVED"
            );
        }
    }
}
