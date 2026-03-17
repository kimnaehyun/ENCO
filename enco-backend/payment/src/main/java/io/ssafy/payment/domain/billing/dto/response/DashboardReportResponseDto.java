package io.ssafy.payment.domain.billing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class DashboardReportResponseDto {

    private Long groupId;
    private Long balance;
    private Long paidAmount;
    private Long pointAmount;
}