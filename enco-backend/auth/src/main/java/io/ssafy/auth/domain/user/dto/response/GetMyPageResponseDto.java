package io.ssafy.auth.domain.user.dto.response;

import io.ssafy.auth.domain.user.entity.User;

import java.text.SimpleDateFormat;

public record GetMyPageResponseDto(
	String name,
	String email,
	String phoneNumber,
	String birthDay,
	String gender,
	String address,
	Integer profileUrl
) {
    public static GetMyPageResponseDto of(User user) {
	String formattedBirthDay = user.getBirthDay() == null
		? null
		: new SimpleDateFormat("yyyy-MM-dd").format(user.getBirthDay());

	return new GetMyPageResponseDto(
		user.getName(),
		user.getEmail(),
		user.getPhoneNumber(),
		formattedBirthDay,
		user.getGender() == null ? null : user.getGender().name(),
		user.getAddress(),
		user.getProfileUrl()
	);
    }
}
