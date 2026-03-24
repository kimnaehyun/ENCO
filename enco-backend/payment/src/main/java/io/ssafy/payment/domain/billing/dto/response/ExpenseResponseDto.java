package io.ssafy.payment.domain.billing.dto.response;

import io.ssafy.payment.domain.billing.dto.request.CreateExpenseRequestDto;
import io.ssafy.payment.domain.billing.entity.Charge;
import io.ssafy.payment.domain.billing.entity.ChargeTarget;
import io.ssafy.payment.domain.billing.entity.ChargeTargetStatus;
import io.ssafy.payment.domain.billing.entity.Expense;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ExpenseResponseDto(
        Long expenseId,
        Long chargeId,
        Long groupId,
        BigDecimal amount,
        String useCard,
        int paidCount,
        int totalCount,
        String displayName,
        String transactionType,
        String memo,
        LocalDateTime paidAt,
        String receiptImageUrl,
        String receiverAccountNumber,
        String receiverBankCode,
        String receiverBankName,
        CreateExpenseRequestDto.PaymentInfoDto paymentInfo,
        List<ParticipantDto> participants
) {
    public record ParticipantDto(
            Long chargeTargetId,
            Long userId,
            BigDecimal amount,
            BigDecimal remainingAmount,
            String status
    ) {}

    public static ExpenseResponseDto of(
            Expense expense,
            Charge charge,
            List<ChargeTarget> targets,
            String receiptImageUrl,
            CreateExpenseRequestDto request
    ) {
        int paidCount = (int) targets.stream()
                .filter(t -> t.getStatus() == ChargeTargetStatus.PAID)
                .count();

        List<ParticipantDto> participantDtos = targets.stream()
                .map(t -> new ParticipantDto(
                        t.getId(),
                        t.getUserId(),
                        t.getAmount(),
                        t.getRemainingAmount(),
                        t.getStatus().name()
                ))
                .toList();

        return new ExpenseResponseDto(
                expense.getId(),
                charge.getId(),
                charge.getGroupId(),
                request.amount(),
                "총무개인카드",
                paidCount,
                targets.size(),
                expense.getMerchantName(),
                "정산",
                expense.getMemo(),
                expense.getPaidAt(),
                receiptImageUrl,
                charge.getReceiverAccountNumber(),
                charge.getReceiverBankCode(),
                charge.getReceiverBankName(),
                request.paymentInfo(),
                participantDtos
        );
    }
}
