package io.ssafy.payment.domain.onsite.service;

import io.ssafy.payment.domain.account.entity.Account;
import io.ssafy.payment.domain.account.repository.AccountRepository;
import io.ssafy.payment.domain.card.entity.Card;
import io.ssafy.payment.domain.card.repository.CardRepository;
import io.ssafy.payment.domain.transaction.entity.Direction;
import io.ssafy.payment.domain.transaction.entity.Status;
import io.ssafy.payment.domain.transaction.entity.TransactionHistory;
import io.ssafy.payment.domain.transaction.entity.Type;
import io.ssafy.payment.domain.transaction.repository.TransactionHistoryRepository;
import io.ssafy.payment.domain.vote.dto.request.PointUseRequestDto;
import io.ssafy.payment.global.common.error.CustomException;
import io.ssafy.payment.global.common.error.ErrorCode;
import io.ssafy.payment.infra.client.UserServiceClient;
import io.ssafy.payment.infra.messaging.producer.KafkaProducerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class OnsitePaymentExecuteService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final StringRedisTemplate stringRedisTemplate; // 위치/알림 키 삭제용
    private final AccountRepository accountRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final CardRepository cardRepository;
    private final KafkaProducerService kafkaProducerService;
    private final UserServiceClient userServiceClient;

    private static final String BARCODE_AUTH_PREFIX = "onsite:auth:";

    @Transactional
    public void executeBarcodePayment(String barcodeNumber, BigDecimal amount, String merchantName, Long cardId, Boolean usePoint, String idempotencyKey) {
        // 1. 멱등키 및 요청 금액 검증
        if (idempotencyKey != null && transactionHistoryRepository.existsByIdempotencyKey(idempotencyKey)) {
            log.warn("[현장결제] 이미 처리된 중복 결제 요청입니다. 무시합니다. 멱등키={}", idempotencyKey);
            throw new CustomException(ErrorCode.DUPLICATE_PAYMENT);
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("[현장결제] 유효하지 않은 결제 금액 요청: {}", amount);
            throw new CustomException(ErrorCode.INVALID_PAYMENT_AMOUNT);
        }

        // 2. 바코드 검증 및 모임 ID 획득
        String redisKey = BARCODE_AUTH_PREFIX + barcodeNumber;
        Integer groupIdObj = (Integer) redisTemplate.opsForValue().get(redisKey);

        if (groupIdObj == null) {
            log.warn("[현장결제] 유효하지 않거나 만료된 바코드 결제 시도: {}", barcodeNumber);
            throw new CustomException(ErrorCode.INVALID_OR_EXPIRED_BARCODE);
        }
        Long groupId = Long.valueOf(groupIdObj);

        // 3. 카드 및 계좌 조회
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_CARD));

        Account account = accountRepository.findByGroupId(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_ACCOUNT));

        // 4. 포인트 결제 처리 (프론트에서 null을 보낼 수도 있으니 안전하게 처리)
        boolean isUsePoint = Boolean.TRUE.equals(usePoint);
        BigDecimal usedPoints = processPointPayment(groupId, amount, isUsePoint);

        // 5. 실제 출금해야 할 현금 계산
        BigDecimal cashToPay = amount.subtract(usedPoints);

        // 6. 현금 잔액 검증 및 차감
        if (cashToPay.compareTo(BigDecimal.ZERO) > 0) {
            if (account.getAmount().compareTo(cashToPay) < 0) {
                log.warn("[현장결제] 잔액 부족: groupId={}, 필요현금={}, 남은잔액={}", groupId, cashToPay, account.getAmount());

                // 돈이 모자라면 아까 선차감한 포인트 다시 돌려주기! (보상 트랜잭션)
                rollbackPointPayment(groupId, usedPoints);
                throw new CustomException(ErrorCode.INSUFFICIENT_BALANCE);
            }
            // 검증 통과했으면 현금 출금!
            account.deductAmount(cashToPay);
        }

        // 7. 거래 내역 저장 (한 번만 깔끔하게 저장)
        TransactionHistory history = TransactionHistory.builder()
                .accountId(account.getId())
                .amount(amount) // 결제 총액
                .balance(account.getAmount()) // 결제 후 계좌 잔액
                .counterpartyBankCode("999")
                .counterpartyBankName("현장 결제")
                .counterpartyBankAccountNumber(generateRandomBankAccountNumber())
                .counterpartyName(merchantName)
                .displayName(merchantName)
                .type(Type.CARD_PAYMENT)
                .cardId(card.getId())
                .direction(Direction.OUT)
                .status(Status.APPROVED)
                .idempotencyKey(idempotencyKey)
                .build();

        transactionHistoryRepository.save(history);

        // 8. 사용 완료된 현장결제 데이터 청소
        redisTemplate.delete(redisKey);
        stringRedisTemplate.delete("onsite:init:" + groupId);
        stringRedisTemplate.delete("onsite:geo:" + groupId);

        log.info("[현장결제 완료] 가맹점={}, 총금액={}, 사용포인트={}, 결제현금={}, groupId={}",
                merchantName, amount, usedPoints, cashToPay, groupId);

        // 9. 완료 알림 발송
        try {
            kafkaProducerService.sendOnsitePaymentComplete(groupId, amount, merchantName);
        } catch (Exception e) {
            log.error("[현장결제] 결제는 성공했지만 카프카 알림 전송에 실패했습니다. groupId={}", groupId, e);
        }
    }

    private String generateRandomBankAccountNumber() {
        int part1 = java.util.concurrent.ThreadLocalRandom.current().nextInt(100000, 1000000); // 6자리 랜덤
        int part2 = java.util.concurrent.ThreadLocalRandom.current().nextInt(10000, 100000);  // 5자리 랜덤

        return "222-" + part1 + "-" + part2;
    }

    /**
     * 포인트 조회 및 차감을 전담하는 메서드 (현장 결제용)
     */
    private BigDecimal processPointPayment(Long groupId, BigDecimal totalAmount, boolean usePoint) {
        if (!usePoint) {
            return BigDecimal.ZERO;
        }

        try {
            BigDecimal pointBalance = userServiceClient.getGroupPointBalance(groupId).result();

            if (pointBalance == null || pointBalance.compareTo(BigDecimal.ZERO) <= 0) {
                return BigDecimal.ZERO;
            }

            BigDecimal usedPoints = totalAmount.min(pointBalance);

            if (usedPoints.compareTo(BigDecimal.ZERO) > 0) {
                // 현장 결제는 투표가 아니므로 voteId 자리에 null을 넣습니다.
                userServiceClient.deductGroupPoint(groupId, new PointUseRequestDto(usedPoints, null));
            }
            log.info("포인트 잔액 : {} 사용 포인트 : {}", pointBalance, usedPoints);
            return usedPoints;

        } catch (Exception e) {
            log.error("[현장결제] Auth 서버 포인트 조회/차감 오류: groupId={}", groupId, e);
            throw new CustomException(ErrorCode.POINT_SYSTEM_ERROR);
        }
    }

    /**
     * 포인트 롤백 (보상 트랜잭션) 메서드 (현장 결제용)
     */
    private void rollbackPointPayment(Long groupId, BigDecimal usedPoints) {
        if (usedPoints.compareTo(BigDecimal.ZERO) > 0) {
            try {
                log.info("[현장결제] 결제 실패로 인한 포인트 롤백 요청: groupId={}, amount={}", groupId, usedPoints);

                // 현장 결제는 투표가 아니므로 voteId 자리에 null을 넣습니다.
                userServiceClient.refundGroupPoint(groupId, new PointUseRequestDto(usedPoints, null));

            } catch (Exception e) {
                log.error("[현장결제] 포인트 롤백 실패! 수동 확인 필요: groupId={}", groupId, e);
            }
        }
    }
}