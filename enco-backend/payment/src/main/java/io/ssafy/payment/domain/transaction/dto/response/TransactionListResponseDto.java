package io.ssafy.payment.domain.transaction.dto.response;

import io.ssafy.payment.domain.transaction.entity.Direction;
import io.ssafy.payment.domain.transaction.entity.TransactionHistory;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record TransactionListResponseDto(
        List<TransactionDto> transactions,
        Long nextCursor,
        boolean hasNext
) {
    public record TransactionDto(
            Long transactionId,
            LocalDateTime transactionDate,
            String title,
            String type,
            BigDecimal amount,
            BigDecimal balanceAfter
    ) {
        public static TransactionDto from(TransactionHistory th) {
            return new TransactionDto(
                    th.getId(),
                    th.getCreatedAt(),
                    th.getDisplayName(),
                    th.getDirection() == Direction.IN ? "DEPOSIT" : "WITHDRAW",
                    th.getAmount(),
                    th.getBalance()
            );
        }
    }
}
