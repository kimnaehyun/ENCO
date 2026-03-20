package io.ssafy.payment.domain.billing.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record DuesPaymentResponseDto(
        Long paymentId,
        Long groupId,
        Long payerUserId,
        BigDecimal totalAmount,
        LocalDateTime paidAt,
        List<AllocationDto> allocations
) {
    public record AllocationDto(
            Long chargeTargetId,
            BigDecimal allocatedAmount,
            String chargeStatus,
            BigDecimal remainingAmount
    ) {}
}
