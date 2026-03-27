package io.ssafy.auth.domain.user.dto.request;

public record EditMyPageRequestDto(
	String phoneNumber,
	String address,
	Integer profileUrl
) {
}
