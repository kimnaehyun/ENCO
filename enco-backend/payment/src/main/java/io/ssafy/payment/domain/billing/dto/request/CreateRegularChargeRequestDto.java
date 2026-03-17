package io.ssafy.payment.domain.billing.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateRegularChargeRequestDto(

        @NotNull(message = "정책 ID는 필수입니다.")
        Long policyId,

        @NotNull(message = "청구 금액은 필수입니다.")
        @DecimalMin(value = "0.01", message = "청구 금액은 0보다 커야 합니다.")
        BigDecimal amount
) {
}
