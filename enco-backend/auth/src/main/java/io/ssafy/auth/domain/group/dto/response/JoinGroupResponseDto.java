package io.ssafy.auth.domain.group.dto.response;

import io.ssafy.auth.domain.group.entity.Group;

public record JoinGroupResponseDto(
        Long groupId,
        String groupName
) {
    public static JoinGroupResponseDto from(Group group) {
        return new JoinGroupResponseDto(group.getId(), group.getName());
    }
}
