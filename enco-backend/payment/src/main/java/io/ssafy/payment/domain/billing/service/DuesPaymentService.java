package io.ssafy.payment.domain.billing.service;

import io.ssafy.payment.domain.account.entity.Account;
import io.ssafy.payment.domain.account.repository.AccountRepository;
import io.ssafy.payment.domain.billing.dto.request.CreateFreePaymentRequestDto;
import io.ssafy.payment.domain.billing.dto.request.CreateSelectedPaymentRequestDto;
import io.ssafy.payment.domain.billing.dto.response.DuesPaymentResponseDto;
import io.ssafy.payment.domain.billing.entity.ChargeTarget;
import io.ssafy.payment.domain.billing.entity.ChargeTargetStatus;
import io.ssafy.payment.domain.billing.entity.DuePayment;
import io.ssafy.payment.domain.billing.entity.DuesPaymentStatus;
import io.ssafy.payment.domain.billing.repository.ChargeTargetRepository;
import io.ssafy.payment.domain.billing.repository.DuePaymentRepository;
import io.ssafy.payment.domain.transaction.entity.Direction;
import io.ssafy.payment.domain.transaction.entity.Status;
import io.ssafy.payment.domain.transaction.entity.TransactionHistory;
import io.ssafy.payment.domain.transaction.entity.Type;
import io.ssafy.payment.domain.transaction.repository.TransactionHistoryRepository;
import io.ssafy.payment.global.common.BankCode;
import io.ssafy.payment.global.common.error.CustomException;
import io.ssafy.payment.global.common.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DuesPaymentService {

    private final DuePaymentRepository duePaymentRepository;
    private final ChargeTargetRepository chargeTargetRepository;
    private final AccountRepository accountRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;

    @Transactional
    public DuesPaymentResponseDto payFree(Long groupId, Long userId, String idempotencyKey, CreateFreePaymentRequestDto request) {
        if (transactionHistoryRepository.existsByIdempotencyKey(idempotencyKey)) {
            throw new CustomException(ErrorCode.DUPLICATE_PAYMENT);
        }

        Account account = accountRepository.findByGroupIdAndIsDeletedFalse(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.SERVER_ERROR));

        // 미납/부분납부 청구 대상 - 오래된 순
        List<ChargeTarget> targets = chargeTargetRepository
                .findByUserIdAndCharge_GroupIdAndStatusInAndIsDeletedFalseOrderByCreatedAtAsc(
                        userId, groupId, List.of(ChargeTargetStatus.UNPAID, ChargeTargetStatus.PARTIAL));

        BigDecimal remaining = request.amount();
        LocalDateTime paidAt = LocalDateTime.now();
        Long firstPaymentId = null;
        List<DuesPaymentResponseDto.AllocationDto> allocations = new ArrayList<>();

        for (ChargeTarget target : targets) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal payAmount = remaining.compareTo(target.getRemainingAmount()) >= 0
                    ? target.getRemainingAmount()
                    : remaining;

            DuePayment payment = DuePayment.builder()
                    .payerUserId(userId)
                    .groupId(groupId)
                    .chargeTarget(target)
                    .amount(payAmount)
                    .memo(request.memo())
                    .idempotencyKey(UUID.randomUUID().toString())
                    .status(DuesPaymentStatus.SUCCESS)
                    .build();

            DuePayment saved = duePaymentRepository.save(payment);
            if (firstPaymentId == null) firstPaymentId = saved.getId();

            target.pay(payAmount);
            remaining = remaining.subtract(payAmount);

            allocations.add(new DuesPaymentResponseDto.AllocationDto(
                    target.getId(), payAmount, target.getStatus().name(), target.getRemainingAmount()));
        }

        // 계좌 입금
        accountRepository.depositByGroupId(groupId, request.amount());
        BigDecimal newBalance = account.getAmount().add(request.amount());

        // TransactionHistory 1건 저장 (클라이언트 idempotencyKey 사용)
        transactionHistoryRepository.save(TransactionHistory.builder()
                .accountId(account.getId())
                .type(Type.TRANSFER)
                .direction(Direction.IN)
                .amount(request.amount())
                .balance(newBalance)
                .memo(request.memo())
                .displayName(request.depositDisplayName())
                .counterpartyBankName(request.withdrawAccountBankName())
                .counterpartyBankCode(BankCode.codeOf(request.withdrawAccountBankName()))
                .counterpartyBankAccountNumber(request.withdrawAccountNumber())
                .counterpartyName(request.withdrawDisplayName())
                .status(Status.APPROVED)
                .idempotencyKey(idempotencyKey)
                .build());

        return new DuesPaymentResponseDto(firstPaymentId, groupId, userId, request.amount(), paidAt, allocations);
    }

    @Transactional
    public DuesPaymentResponseDto paySelected(Long groupId, Long userId, String idempotencyKey, CreateSelectedPaymentRequestDto request) {
        if (transactionHistoryRepository.existsByIdempotencyKey(idempotencyKey)) {
            throw new CustomException(ErrorCode.DUPLICATE_PAYMENT);
        }

        Account account = accountRepository.findByGroupIdAndIsDeletedFalse(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.SERVER_ERROR));

        List<ChargeTarget> targets = chargeTargetRepository.findAllById(request.targetChargeTargetIds());

        BigDecimal totalPaid = BigDecimal.ZERO;
        Long firstPaymentId = null;
        LocalDateTime paidAt = LocalDateTime.now();
        List<DuesPaymentResponseDto.AllocationDto> allocations = new ArrayList<>();

        for (ChargeTarget target : targets) {
            if (!target.getCharge().getGroupId().equals(groupId)) {
                throw new CustomException(ErrorCode.CHARGE_TARGET_NOT_FOUND);
            }
            if (target.getStatus() == ChargeTargetStatus.PAID) continue;

            BigDecimal payAmount = target.getRemainingAmount();

            DuePayment payment = DuePayment.builder()
                    .payerUserId(userId)
                    .groupId(groupId)
                    .chargeTarget(target)
                    .amount(payAmount)
                    .memo(request.memo())
                    .idempotencyKey(UUID.randomUUID().toString())
                    .status(DuesPaymentStatus.SUCCESS)
                    .build();

            DuePayment saved = duePaymentRepository.save(payment);
            if (firstPaymentId == null) firstPaymentId = saved.getId();

            target.pay(payAmount);
            totalPaid = totalPaid.add(payAmount);

            allocations.add(new DuesPaymentResponseDto.AllocationDto(
                    target.getId(), payAmount, target.getStatus().name(), target.getRemainingAmount()));
        }

        if (totalPaid.compareTo(BigDecimal.ZERO) > 0) {
            accountRepository.depositByGroupId(groupId, totalPaid);
        }

        BigDecimal newBalance = account.getAmount().add(totalPaid);

        // TransactionHistory 1건 저장 (클라이언트 idempotencyKey 사용)
        transactionHistoryRepository.save(TransactionHistory.builder()
                .accountId(account.getId())
                .type(Type.TRANSFER)
                .direction(Direction.IN)
                .amount(totalPaid)
                .balance(newBalance)
                .memo(request.memo())
                .displayName(request.depositDisplayName())
                .counterpartyBankName(request.withdrawAccountBankName())
                .counterpartyBankCode(BankCode.codeOf(request.withdrawAccountBankName()))
                .counterpartyBankAccountNumber(request.withdrawAccountNumber())
                .counterpartyName(request.withdrawDisplayName())
                .status(Status.APPROVED)
                .idempotencyKey(idempotencyKey)
                .build());

        return new DuesPaymentResponseDto(firstPaymentId, groupId, userId, totalPaid, paidAt, allocations);
    }
}
