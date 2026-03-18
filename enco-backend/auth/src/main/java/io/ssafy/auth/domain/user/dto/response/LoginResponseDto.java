package io.ssafy.auth.domain.user.dto.response;

import io.ssafy.auth.domain.user.entity.User;

public record LoginResponseDto (Long id, String name, String deviceToken, String accessToken, long expiresIn, String tokenType) {
    public static LoginResponseDto of(User user, String accessToken, long expiresIn) {
        return new LoginResponseDto(
                user.getId(),
                user.getName(),
                user.getDeviceToken(),
                accessToken, expiresIn, "Bearer");
    }
}
