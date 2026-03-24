package io.ssafy.payment.domain.billing.dto.response;

import io.ssafy.payment.domain.billing.entity.Charge;
import io.ssafy.payment.domain.billing.entity.ChargeTarget;
import io.ssafy.payment.domain.billing.entity.Expense;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ExpenseResponseDto(
        Long expenseId,
        Long chargeId,
        Long groupId,
        String displayName,
        BigDecimal amount,
        String receiptImageUrl,
        LocalDateTime dueDate,
        List<ParticipantDto> participants
) {
    public record ParticipantDto(Long chargeTargetId, Long userId, BigDecimal amount, String status) {}

    public static ExpenseResponseDto of(Expense expense, Charge charge, List<ChargeTarget> targets, String receiptImageUrl) {
        List<ParticipantDto> participantDtos = targets.stream()
                .map(t -> new ParticipantDto(t.getId(), t.getUserId(), t.getAmount(), t.getStatus().name()))
                .toList();

        return new ExpenseResponseDto(
                expense.getId(),
                charge.getId(),
                charge.getGroupId(),
                expense.getMerchantName(),
                charge.getTotalAmount(),
                receiptImageUrl,
                charge.getDueDate(),
                participantDtos
        );
    }
}
