package io.ssafy.auth.domain.user.service;

import io.ssafy.auth.domain.user.dto.request.UserJoinRequestDto;
import io.ssafy.auth.domain.user.dto.response.LoginResponseDto;
import io.ssafy.auth.domain.user.dto.response.UserJoinResponseDto;
import io.ssafy.auth.domain.user.entity.User;
import io.ssafy.auth.domain.user.repository.UserRepository;
import io.ssafy.auth.global.common.error.CustomException;
import io.ssafy.auth.global.common.error.ErrorCode;
import io.ssafy.auth.global.security.JwtProvider;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;


@Service
@AllArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtProvider jwtProvider;

    @Override
    public UserJoinResponseDto signup(UserJoinRequestDto userRequest) {
        if(validateDuplicateEmail(userRequest.email())) {
            throw new CustomException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        String generatedDeviceToken = UUID.randomUUID().toString();
        User user = userRepository.save(userRequest.toEntity(encoder, generatedDeviceToken));
        return UserJoinResponseDto.of(user);
    }

    @Override
    public LoginResponseDto login(String deviceToken, String pinCode) {
        User user = userRepository.findByDeviceToken(deviceToken)
                .orElseThrow(() -> new CustomException(ErrorCode.BAD_REQUEST));

        if (!encoder.matches(pinCode, user.getPinCode())) {
            throw new CustomException(ErrorCode.NOT_CORRECT_PINCODE);
        }

        String accessToken = jwtProvider.createAccessToken(user.getId());
        return LoginResponseDto.of(user, accessToken, jwtProvider.getAccessExpiration());
    }

    public boolean validateDuplicateEmail(String email){
        return userRepository.existsByEmail(email);
    }
}
