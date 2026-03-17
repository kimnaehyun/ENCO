package io.ssafy.payment.domain.billing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.http.HttpStatusCode;

@Getter
@Builder
@AllArgsConstructor
public class GroupDashboardResponseDto {

    private Long groupId;
    private String groupName;
    private PaymentStatus paymentStatus;
    private Long balance;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class PaymentStatus {
        private int paidCount;
        private int unpaidCount;
        private double paidRatio;
        private double unpaidRatio;
    }
}