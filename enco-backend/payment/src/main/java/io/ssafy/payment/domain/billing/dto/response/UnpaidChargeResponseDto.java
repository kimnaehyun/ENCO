package io.ssafy.payment.domain.billing.dto.response;

import io.ssafy.payment.domain.billing.entity.ChargeTarget;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record UnpaidChargeResponseDto(
        Long groupId,
        Long userId,
        BigDecimal totalUnpaidAmount,
        int totalUnpaidCount,
        List<UnpaidChargeItemDto> charges
) {
    public record UnpaidChargeItemDto(
            Long chargeTargetId,
            Long chargeId,
            String displayName,
            BigDecimal amount,
            BigDecimal paidAmount,
            BigDecimal remainingAmount,
            LocalDateTime createdAt
    ) {
        public static UnpaidChargeItemDto from(ChargeTarget target) {
            BigDecimal paidAmount = target.getAmount().subtract(target.getRemainingAmount());
            return new UnpaidChargeItemDto(
                    target.getId(),
                    target.getCharge().getId(),
                    target.getCharge().getDisplayName(),
                    target.getAmount(),
                    paidAmount,
                    target.getRemainingAmount(),
                    target.getCreatedAt()
            );
        }
    }

    public static UnpaidChargeResponseDto of(Long groupId, Long userId, List<ChargeTarget> targets) {
        List<UnpaidChargeItemDto> items = targets.stream()
                .map(UnpaidChargeItemDto::from)
                .toList();

        BigDecimal totalUnpaidAmount = targets.stream()
                .map(ChargeTarget::getRemainingAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new UnpaidChargeResponseDto(groupId, userId, totalUnpaidAmount, items.size(), items);
    }
}
