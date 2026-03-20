package io.ssafy.auth.domain.group.dto.response;

import io.ssafy.auth.domain.group.entity.DuePolicy;
import io.ssafy.auth.domain.group.entity.Group;
import io.ssafy.auth.domain.group.entity.GroupType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record GroupSettingResponseDto(
        Long groupId,
        String groupName,
        String introduction,
        List<TypeDto> types,
        LocalDateTime createdAt,
        PolicyDto policy,
        String groundRule,
        CardDto card
) {
    public record TypeDto(Long typeId, String typeName) {
        public static TypeDto from(GroupType groupType) {
            return new TypeDto(
                    groupType.getType().getId(),
                    groupType.getType().getName()
            );
        }
    }

    public record PolicyDto(Long policyId, Integer dayOfMonth, BigDecimal monthlyFee) {
        public static PolicyDto from(DuePolicy policy) {
            return new PolicyDto(policy.getId(), policy.getDayOfMonth(), policy.getAmount());
        }
    }

    public record CardDto(Long cardId, String cardName, String frontCardImageUrl, String backCardImageUrl, Boolean isBasic) {}

    public static GroupSettingResponseDto of(Group group, DuePolicy policy, CardDto card) {
        List<TypeDto> types = group.getGroupTypeList().stream()
                .map(TypeDto::from)
                .toList();

        return new GroupSettingResponseDto(
                group.getId(),
                group.getName(),
                group.getIntroduction(),
                types,
                group.getCreatedAt(),
                policy != null ? PolicyDto.from(policy) : null,
                group.getGroundRule(),
                card
        );
    }
}
