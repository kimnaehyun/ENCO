package io.ssafy.auth.domain.user.dto.response;

import io.ssafy.auth.domain.user.entity.User;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public record GetMyPageResponseDto(
	String name,
	String email,
	String phoneNumber,
	String birthDay,
	String gender,
	String address,
	Integer profileUrl
) {
    private static final DateTimeFormatter BIRTHDAY_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public static GetMyPageResponseDto of(User user) {
	String formattedBirthDay = user.getBirthDay() == null
		? null
		: user.getBirthDay().toInstant()
			.atZone(ZoneId.systemDefault())
			.toLocalDate()
			.format(BIRTHDAY_FORMATTER);

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
