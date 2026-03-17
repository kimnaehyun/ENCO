package io.ssafy.payment.domain.billing.entity;

public enum ChargeTargetStatus {
    UNPAID,  // 미납
    PARTIAL, // 부분 납부
    PAID     // 납부 완료
}