package io.ssafy.auth.domain.user.dto.response;

import io.ssafy.auth.domain.user.entity.User;

public record LoginResponseDto (Long id, String name, String deviceToken, String accessToken, int expiresIn, String tokenType) {
    public static LoginResponseDto of(User user) {
        return new LoginResponseDto(
                user.getId(),
                user.getName(),
                user.getDeviceToken(),
                "1", 1, "1");
    }
}
