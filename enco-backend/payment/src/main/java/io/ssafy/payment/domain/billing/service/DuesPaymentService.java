package io.ssafy.payment.domain.billing.service;

import io.ssafy.payment.domain.account.repository.AccountRepository;
import io.ssafy.payment.domain.billing.dto.request.CreateFreePaymentRequestDto;
import io.ssafy.payment.domain.billing.dto.request.CreateSelectedPaymentRequestDto;
import io.ssafy.payment.domain.billing.entity.ChargeTarget;
import io.ssafy.payment.domain.billing.entity.ChargeTargetStatus;
import io.ssafy.payment.domain.billing.entity.DuePayment;
import io.ssafy.payment.domain.billing.entity.DuesPaymentStatus;
import io.ssafy.payment.domain.billing.repository.ChargeTargetRepository;
import io.ssafy.payment.domain.billing.repository.DuePaymentRepository;
import io.ssafy.payment.global.common.error.CustomException;
import io.ssafy.payment.global.common.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DuesPaymentService {

    private final DuePaymentRepository duePaymentRepository;
    private final ChargeTargetRepository chargeTargetRepository;
    private final AccountRepository accountRepository;

    @Transactional
    public void payFree(Long groupId, Long userId, CreateFreePaymentRequestDto request) {
        accountRepository.depositByGroupId(groupId, request.amount());
    }

    @Transactional
    public void paySelected(Long groupId, Long userId, CreateSelectedPaymentRequestDto request) {
        List<ChargeTarget> targets = chargeTargetRepository.findAllById(request.targetChargeTargetIds());

        BigDecimal totalPaid = BigDecimal.ZERO;

        for (ChargeTarget target : targets) {
            if (!target.getCharge().getGroupId().equals(groupId)) {
                throw new CustomException(ErrorCode.CHARGE_TARGET_NOT_FOUND);
            }
            if (target.getStatus() == ChargeTargetStatus.PAID) {
                continue;
            }

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

            duePaymentRepository.save(payment);
            target.pay(payAmount);
            totalPaid = totalPaid.add(payAmount);
        }

        if (totalPaid.compareTo(BigDecimal.ZERO) > 0) {
            accountRepository.depositByGroupId(groupId, totalPaid);
        }
    }
}
