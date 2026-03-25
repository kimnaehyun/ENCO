package io.ssafy.payment.domain.onsite.service;


import io.ssafy.payment.domain.account.entity.Account;
import io.ssafy.payment.domain.account.repository.AccountRepository;
import io.ssafy.payment.domain.card.repository.CardRepository;
import io.ssafy.payment.domain.transaction.entity.Direction;
import io.ssafy.payment.domain.transaction.entity.Status;
import io.ssafy.payment.domain.transaction.entity.TransactionHistory;
import io.ssafy.payment.domain.transaction.entity.Type;
import io.ssafy.payment.domain.transaction.repository.TransactionHistoryRepository;
import io.ssafy.payment.global.common.error.CustomException;
import io.ssafy.payment.global.common.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class OnsitePaymentExecuteService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final AccountRepository accountRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final CardRepository cardRepository;

    private static final String BARCODE_AUTH_PREFIX = "onsite:auth:";

    @Transactional
    public void executeBarcodePayment(String barcodeNumber, BigDecimal amount, String merchantName, Long cardId) {
        String redisKey = BARCODE_AUTH_PREFIX + barcodeNumber;
        Integer groupIdObj = (Integer) redisTemplate.opsForValue().get(redisKey);

        if (groupIdObj == null) {
            log.warn("[현장결제] 유효하지 않거나 만료된 바코드 결제 시도: {}", barcodeNumber);
            throw new CustomException(ErrorCode.INVALID_OR_EXPIRED_BARCODE);
        }
        Long groupId = Long.valueOf(groupIdObj);

        Account account = accountRepository.findByGroupId(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_ACCOUNT));

        if (account.getAmount().compareTo(amount) < 0) {
            log.warn("[현장결제] 잔액 부족: groupId={}, 요청금액={}, 남은잔액={}", groupId, amount, account.getAmount());
            throw new CustomException(ErrorCode.INSUFFICIENT_BALANCE);
        }

        account.deductAmount(amount);

        TransactionHistory history = TransactionHistory.builder()
                .accountId(account.getId())
                .amount(amount)
                .counterpartyName(merchantName)
                .displayName(merchantName)
                .type(Type.CARD_PAYMENT)
                .direction(Direction.OUT)
                .status(Status.APPROVED)
                .build();

        transactionHistoryRepository.save(history);

        redisTemplate.delete(redisKey);

        log.info("[현장결제 완료] 가맹점={}, 금액={}, groupId={}", merchantName, amount, groupId);
    }
}