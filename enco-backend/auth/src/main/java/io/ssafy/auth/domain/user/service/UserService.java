package io.ssafy.auth.domain.user.service;


import io.ssafy.auth.domain.user.dto.request.UserJoinRequestDto;
import io.ssafy.auth.domain.user.dto.response.LoginResponseDto;
import io.ssafy.auth.domain.user.dto.response.UserJoinResponseDto;


public interface UserService {
    UserJoinResponseDto signup(UserJoinRequestDto userRequest) throws Exception;
    LoginResponseDto login(String deviceToken, String pinCode) throws Exception;
}
