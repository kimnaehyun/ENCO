package io.ssafy.auth.domain.group.dto.response;

import io.ssafy.auth.domain.group.entity.DuePolicy;
import io.ssafy.auth.domain.group.entity.DuePolicyStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record DuePolicyResponseDto(
        Long policyId,
        Long groupId,
        BigDecimal amount,
        Integer billingDay,
        LocalDate startDate,
        DuePolicyStatus status
) {
    public static DuePolicyResponseDto from(DuePolicy policy) {
        return new DuePolicyResponseDto(
                policy.getId(),
                policy.getGroupId(),
                policy.getAmount(),
                policy.getDayOfMonth(),
                policy.getStartDate(),
                policy.getStatus()
        );
    }
}
