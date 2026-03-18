package io.ssafy.auth.domain.user.dto.request;

public record LoginRequestDto (String pinCode, String deviceToken) {
}
