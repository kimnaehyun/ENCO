package io.ssafy.auth.domain.group.dto.response;

import io.ssafy.auth.domain.group.entity.GroupInvite;

import java.time.LocalDateTime;

public record InviteLinkResponseDto(
        String token,
        Long groupId,
        LocalDateTime expiresAt
) {
    public static InviteLinkResponseDto from(GroupInvite invite) {
        return new InviteLinkResponseDto(
                invite.getToken(),
                invite.getGroupId(),
                invite.getExpiresAt()
        );
    }
}
