package io.ssafy.payment.domain.billing.dto.response;

import io.ssafy.payment.domain.billing.entity.Charge;
import io.ssafy.payment.domain.billing.entity.ChargeStatus;
import io.ssafy.payment.domain.billing.entity.ChargeTarget;
import io.ssafy.payment.domain.billing.entity.ChargeTargetStatus;
import io.ssafy.payment.domain.billing.entity.ChargeType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ChargeResponseDto(
        Long chargeId,
        Long groupId,
        String displayName,
        BigDecimal totalAmount,
        ChargeType chargeType,
        ChargeStatus status,
        LocalDateTime dueDate,
        LocalDateTime createdAt,
        List<ChargeTargetDto> targets
) {
    public record ChargeTargetDto(
            Long chargeTargetId,
            Long userId,
            BigDecimal amount,
            ChargeTargetStatus status
    ) {
        public static ChargeTargetDto from(ChargeTarget target) {
            return new ChargeTargetDto(
                    target.getId(),
                    target.getUserId(),
                    target.getAmount(),
                    target.getStatus()
            );
        }
    }

    public static ChargeResponseDto of(Charge charge, List<ChargeTarget> targets) {
        return new ChargeResponseDto(
                charge.getId(),
                charge.getGroupId(),
                charge.getDisplayName(),
                charge.getTotalAmount(),
                charge.getChargeType(),
                charge.getStatus(),
                charge.getDueDate(),
                charge.getCreatedAt(),
                targets.stream().map(ChargeTargetDto::from).toList()
        );
    }
}
