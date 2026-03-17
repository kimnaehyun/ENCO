package io.ssafy.auth.domain.user.dto.response;

import io.ssafy.auth.domain.user.entity.User;

public record UserJoinResponseDto (Long id, String deviceToken, String pinCode) {
    public static UserJoinResponseDto of(User user) {
        return new UserJoinResponseDto(
                user.getId(),
                user.getDeviceToken(),
                user.getPinCode()
        );
    }
}