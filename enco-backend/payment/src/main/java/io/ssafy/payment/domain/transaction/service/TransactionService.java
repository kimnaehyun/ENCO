package io.ssafy.payment.domain.transaction.service;

import io.ssafy.payment.domain.account.entity.Account;
import io.ssafy.payment.domain.account.repository.AccountRepository;
import io.ssafy.payment.domain.billing.entity.Expense;
import io.ssafy.payment.domain.billing.repository.ExpenseRepository;
import io.ssafy.payment.domain.card.repository.CardRepository;
import io.ssafy.payment.domain.transaction.dto.response.TransactionDetailResponseDto;
import io.ssafy.payment.domain.transaction.dto.response.TransactionListResponseDto;
import io.ssafy.payment.domain.transaction.dto.response.TransactionListResponseDto.ItemDto;
import io.ssafy.payment.domain.transaction.entity.Direction;
import io.ssafy.payment.domain.transaction.entity.TransactionHistory;
import io.ssafy.payment.domain.transaction.repository.TransactionHistoryRepository;
import io.ssafy.payment.global.common.error.CustomException;
import io.ssafy.payment.global.common.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionHistoryRepository transactionHistoryRepository;
    private final AccountRepository accountRepository;
    private final ExpenseRepository expenseRepository;
    private final CardRepository cardRepository;

    @Transactional(readOnly = true)
    public TransactionListResponseDto getTransactions(
            Long groupId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String sort,
            String type,
            Long cursorEpochMilli,
            int size
    ) {
        Account account = accountRepository.findByGroupIdAndIsDeletedFalse(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.SERVER_ERROR));

        LocalDateTime cursor = cursorEpochMilli != null
                ? LocalDateTime.ofInstant(Instant.ofEpochMilli(cursorEpochMilli), ZoneOffset.UTC)
                : null;

        Direction direction = switch (type) {
            case "DEPOSIT" -> Direction.IN;
            case "WITHDRAW" -> Direction.OUT;
            default -> null; // ALL
        };

        boolean isOldest = "OLDEST".equals(sort);
        int fetchSize = size + 1;

        List<TransactionHistory> transactions = isOldest
                ? transactionHistoryRepository.findOldestWithCursor(account.getId(), direction, startDate, endDate, cursor, fetchSize)
                : transactionHistoryRepository.findLatestWithCursor(account.getId(), direction, startDate, endDate, cursor, fetchSize);

        // DEPOSIT 필터일 경우 Expense(지출)는 제외
        List<Expense> expenses = "DEPOSIT".equals(type)
                ? List.of()
                : (isOldest
                    ? expenseRepository.findOldestWithCursor(groupId, startDate, endDate, cursor, fetchSize)
                    : expenseRepository.findLatestWithCursor(groupId, startDate, endDate, cursor, fetchSize));

        // TODO: POINT는 auth 서비스 pointHistory 구현 후 Feign으로 추가

        List<ItemDto> merged = new ArrayList<>();
        transactions.forEach(t -> merged.add(ItemDto.fromTransaction(t)));
        expenses.forEach(e -> merged.add(ItemDto.fromExpense(e, account.getAmount())));

        Comparator<ItemDto> comparator = isOldest
                ? Comparator.comparing(ItemDto::transactionDate)
                : Comparator.comparing(ItemDto::transactionDate).reversed();
        merged.sort(comparator);

        boolean hasNext = merged.size() > size;
        List<ItemDto> page = hasNext ? merged.subList(0, size) : merged;

        Long nextCursor = hasNext
                ? page.get(page.size() - 1).transactionDate()
                        .toInstant(ZoneOffset.UTC).toEpochMilli()
                : null;

        return new TransactionListResponseDto(page, nextCursor, hasNext);
    }

    @Transactional(readOnly = true)
    public TransactionDetailResponseDto getTransactionDetail(Long groupId, Long transactionId) {
        Account account = accountRepository.findByGroupIdAndIsDeletedFalse(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.SERVER_ERROR));

        TransactionHistory th = transactionHistoryRepository.findById(transactionId)
                .orElseThrow(() -> new CustomException(ErrorCode.TRANSACTION_NOT_FOUND));

        if (!th.getAccountId().equals(account.getId())) {
            throw new CustomException(ErrorCode.TRANSACTION_NOT_FOUND);
        }

        String cardName = null;
        if (th.getCardId() != null) {
            cardName = cardRepository.findById(th.getCardId())
                    .map(card -> card.getCardProduct().getName())
                    .orElse(null);
        }

        return TransactionDetailResponseDto.of(th, cardName);
    }
}
