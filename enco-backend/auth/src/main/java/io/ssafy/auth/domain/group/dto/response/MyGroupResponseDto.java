package io.ssafy.auth.domain.group.dto.response;

import io.ssafy.auth.domain.group.dto.request.GroupAccountCardRequestDto;
import io.ssafy.auth.domain.group.entity.GroupUser;

// User 모듈
public record MyGroupResponseDto(
        Long groupId,
        String groupName,
        String role,                        // 역할
        GroupAccountCardRequestDto.AccountInfo account,
        GroupAccountCardRequestDto.CardInfo card
) {
    public static MyGroupResponseDto of(GroupUser groupUser, GroupAccountCardRequestDto accountCard) {
        return new MyGroupResponseDto(
                groupUser.getGroup().getId(),
                groupUser.getGroup().getName(),
                groupUser.getRole().name(),  // LEADER, MEMBER 등
                accountCard != null ? accountCard.account() : null,
                accountCard != null ? accountCard.card() : null
        );
    }
}