package io.ssafy.payment.domain.billing.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.ArrayList;

public record CreateFreePaymentRequestDto(

        String withdrawAccountBankName,
        String withdrawAccountNumber,

        @NotNull(message = "입금 금액은 필수입니다.")
        @DecimalMin(value = "0.01", message = "입금 금액은 0보다 커야 합니다.")
        BigDecimal amount,

        String withdrawDisplayName,
        String depositDisplayName,
        String memo

) {
}
