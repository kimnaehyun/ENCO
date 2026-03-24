package io.ssafy.payment.domain.billing.dto.response;

import io.ssafy.payment.domain.billing.entity.ChargeTarget;
import io.ssafy.payment.domain.billing.entity.ChargeTargetStatus;

import java.math.BigDecimal;
import java.util.List;

public record SettlementDefaultersResponseDto(
        int paidCount,
        int totalCount,
        List<ParticipantDto> participants
) {
    public record ParticipantDto(
            Long chargeTargetId,
            Long userId,
            BigDecimal amount,
            BigDecimal remainingAmount,
            String status
    ) {}

    public static SettlementDefaultersResponseDto of(List<ChargeTarget> targets) {
        int paidCount = (int) targets.stream()
                .filter(t -> t.getStatus() == ChargeTargetStatus.PAID)
                .count();

        List<ParticipantDto> participants = targets.stream()
                .map(t -> new ParticipantDto(
                        t.getId(),
                        t.getUserId(),
                        t.getAmount(),
                        t.getRemainingAmount(),
                        t.getStatus().name()
                ))
                .toList();

        return new SettlementDefaultersResponseDto(paidCount, targets.size(), participants);
    }
}
