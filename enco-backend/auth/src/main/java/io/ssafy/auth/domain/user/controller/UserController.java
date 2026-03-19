package io.ssafy.auth.domain.user.controller;

import io.ssafy.auth.domain.user.dto.request.LoginRequestDto;
import io.ssafy.auth.domain.user.dto.request.ReLoginRequestDto;
import io.ssafy.auth.domain.user.dto.request.UserJoinRequestDto;
import io.ssafy.auth.domain.user.dto.response.LoginResponseDto;
import io.ssafy.auth.domain.user.dto.response.UserJoinResponseDto;
import io.ssafy.auth.domain.user.service.UserServiceImpl;
import io.ssafy.auth.global.common.response.CommonResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/auth")
public class UserController {
    private UserServiceImpl userService;

    /**
     * 회원가입 ( 회원가입 후 자동 로그인)
     * @param dto
     * @return
     */
    @PostMapping("/regist")
    public ResponseEntity<CommonResponse<UserJoinResponseDto>> signUp(@RequestBody UserJoinRequestDto dto) {
        return ResponseEntity.ok(CommonResponse.success(userService.signup(dto)));
    }

    /**
     * 로그인
     * @param loginRequestDto
     * @return
     */
    @PostMapping("/login")
    public ResponseEntity<CommonResponse<LoginResponseDto>> login(@RequestBody LoginRequestDto loginRequestDto) {
        LoginResponseDto responseDto = userService.login(
                loginRequestDto.deviceToken(),
                loginRequestDto.pinCode()
        );
        return ResponseEntity.ok(CommonResponse.success(responseDto));
    }

    /**
     * 재로그인
     * @param reLoginRequestDto
     * @return
     */
    @PostMapping("/re-login")
    public ResponseEntity<CommonResponse<LoginResponseDto>> reLogin(@RequestBody ReLoginRequestDto reLoginRequestDto) {
        LoginResponseDto responseDto = userService.reLogin(reLoginRequestDto);
        return ResponseEntity.ok(CommonResponse.success(responseDto));

    }
}
