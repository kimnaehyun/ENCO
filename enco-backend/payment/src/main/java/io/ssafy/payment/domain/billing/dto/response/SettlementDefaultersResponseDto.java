package io.ssafy.payment.domain.billing.dto.response;

import io.ssafy.payment.domain.billing.entity.ChargeTarget;
import io.ssafy.payment.domain.billing.entity.ChargeTargetStatus;
import io.ssafy.payment.infra.client.AuthServiceClient.UserDetailResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record SettlementDefaultersResponseDto(
        int paidCount,
        int totalCount,
        List<ParticipantDto> participants
) {
    public record ParticipantDto(
            Long chargeTargetId,
            Long userId,
            String name,
            Integer profileImage,
            BigDecimal amount,
            BigDecimal remainingAmount,
            String status
    ) {}

    public static SettlementDefaultersResponseDto of(List<ChargeTarget> targets, Map<Long, UserDetailResponse> userDetailMap) {
        int paidCount = (int) targets.stream()
                .filter(t -> t.getStatus() == ChargeTargetStatus.PAID)
                .count();

        List<ParticipantDto> participants = targets.stream()
                .map(t -> {
                    UserDetailResponse user = userDetailMap.get(t.getUserId());
                    return new ParticipantDto(
                            t.getId(),
                            t.getUserId(),
                            user != null ? user.name() : null,
                            user != null ? user.profileImage() : null,
                            t.getAmount(),
                            t.getRemainingAmount(),
                            t.getStatus().name()
                    );
                })
                .toList();

        return new SettlementDefaultersResponseDto(paidCount, targets.size(), participants);
    }
}
