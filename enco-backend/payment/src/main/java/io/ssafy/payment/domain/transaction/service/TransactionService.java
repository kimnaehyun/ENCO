package io.ssafy.payment.domain.transaction.service;

import io.ssafy.payment.domain.account.entity.Account;
import io.ssafy.payment.domain.account.repository.AccountRepository;
import io.ssafy.payment.domain.transaction.dto.response.TransactionListResponseDto;
import io.ssafy.payment.domain.transaction.entity.Direction;
import io.ssafy.payment.domain.transaction.entity.TransactionHistory;
import io.ssafy.payment.domain.transaction.repository.TransactionHistoryRepository;
import io.ssafy.payment.global.common.error.CustomException;
import io.ssafy.payment.global.common.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionHistoryRepository transactionHistoryRepository;
    private final AccountRepository accountRepository;

    @Transactional(readOnly = true)
    public TransactionListResponseDto getTransactions(
            Long groupId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String sort,
            String type,
            Long cursor,
            int size
    ) {
        Account account = accountRepository.findByGroupIdAndIsDeletedFalse(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.SERVER_ERROR));

        Direction direction = switch (type) {
            case "DEPOSIT" -> Direction.IN;
            case "WITHDRAW" -> Direction.OUT;
            default -> null; // ALL
        };

        // hasNext 확인을 위해 size + 1 조회
        int fetchSize = size + 1;
        List<TransactionHistory> results = "OLDEST".equals(sort)
                ? transactionHistoryRepository.findOldestWithCursor(account.getId(), direction, startDate, endDate, cursor, fetchSize)
                : transactionHistoryRepository.findLatestWithCursor(account.getId(), direction, startDate, endDate, cursor, fetchSize);

        boolean hasNext = results.size() == fetchSize;
        List<TransactionHistory> page = hasNext ? results.subList(0, size) : results;

        Long nextCursor = hasNext ? page.get(page.size() - 1).getId() : null;

        List<TransactionListResponseDto.TransactionDto> transactions = page.stream()
                .map(TransactionListResponseDto.TransactionDto::from)
                .toList();

        return new TransactionListResponseDto(transactions, nextCursor, hasNext);
    }
}
