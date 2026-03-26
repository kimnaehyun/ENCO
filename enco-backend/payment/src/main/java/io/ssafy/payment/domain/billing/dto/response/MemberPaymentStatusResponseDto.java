package io.ssafy.payment.domain.billing.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record MemberPaymentStatusResponseDto(
        Long groupId,
        int totalMemberCount,
        int unpaidCount,
        int paidCount,
        List<MemberStatusDto> unpaidMembers,
        List<MemberStatusDto> paidMembers
) {
    public record MemberStatusDto(
            Long userId,
            String name,
            Integer profileImage,
            String paymentStatus,
            BigDecimal unpaidAmount
    ) {}
}
