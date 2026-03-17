package io.ssafy.auth.domain.group.dto.response;

import io.ssafy.auth.domain.group.entity.GroupUser;
import io.ssafy.auth.domain.group.entity.Role;

public record GroupMemberResponseDto(
        Long userId,
        Role role
) {
    public static GroupMemberResponseDto from(GroupUser groupUser) {
        return new GroupMemberResponseDto(
                groupUser.getUser().getId(),
                groupUser.getRole()
        );
    }
}
