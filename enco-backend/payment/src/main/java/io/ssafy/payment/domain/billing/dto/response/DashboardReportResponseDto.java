package io.ssafy.payment.domain.billing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
@AllArgsConstructor
public class DashboardReportResponseDto {

    private Long groupId;
    private BigDecimal balance;
    private BigDecimal paidAmount;
    private BigDecimal pointAmount;
}