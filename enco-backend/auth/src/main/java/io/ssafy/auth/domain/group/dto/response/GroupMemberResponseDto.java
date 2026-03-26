package io.ssafy.auth.domain.group.dto.response;

import io.ssafy.auth.domain.group.entity.GroupUser;
import io.ssafy.auth.domain.group.entity.Role;

import java.time.LocalDateTime;

public record GroupMemberResponseDto(
        Long userId,
        String name,
        Integer profileImage,
        Role role,
        LocalDateTime joinedAt
) {
    public static GroupMemberResponseDto from(GroupUser groupUser) {
        return new GroupMemberResponseDto(
                groupUser.getUser().getId(),
                groupUser.getUser().getName(),
                groupUser.getUser().getProfileUrl(),
                groupUser.getRole(),
                groupUser.getCreatedAt()
        );
    }
}
