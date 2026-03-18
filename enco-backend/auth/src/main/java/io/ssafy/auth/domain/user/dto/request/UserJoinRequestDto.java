package io.ssafy.auth.domain.user.dto.request;



import io.ssafy.auth.domain.user.entity.Gender;
import io.ssafy.auth.domain.user.entity.User;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Date;

/*
dto -> entity : toEntity
entity -> dto : from
entity + 여러개 -> dto : of
 */
public record UserJoinRequestDto(
        String name,
        String email,
        String password,
        Date birthDay,
        String phoneNumber,
        Gender gender,
        String pinCode,
        String profileUrl
) {
    public User toEntity(PasswordEncoder passwordEncoder, String deviceToken) {
        return User.builder()
                .name(this.name)
                .email(this.email)
                .password(passwordEncoder.encode(this.password))
                .birthDay(this.birthDay)
                .phoneNumber(this.phoneNumber)
                .gender(this.gender)
                .pinCode(passwordEncoder.encode(this.pinCode))
                .profileUrl(this.profileUrl == null ? "기본이미지" : this.profileUrl)
                .deviceToken(deviceToken)
                .build();
    }
}
