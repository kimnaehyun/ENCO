package io.ssafy.auth.domain.user.controller;

import io.ssafy.auth.domain.user.dto.request.LoginRequestDto;
import io.ssafy.auth.domain.user.dto.request.UserJoinRequestDto;
import io.ssafy.auth.domain.user.dto.response.LoginResponseDto;
import io.ssafy.auth.domain.user.dto.response.UserJoinResponseDto;
import io.ssafy.auth.domain.user.service.UserService;
import io.ssafy.auth.global.common.response.CommonResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/auth")
public class UserController {
    private UserService userService;

    /**
     * 회원가입 ( 회원가입 후 자동 로그인)
     * @param dto
     * @return
     */
    @PostMapping("/regist")
    public ResponseEntity<CommonResponse<LoginResponseDto>> signUp(@RequestBody UserJoinRequestDto dto) {
        UserJoinResponseDto joinDto = userService.signup(dto);
        return ResponseEntity.ok(CommonResponse.success(userService.login(joinDto.deviceToken(), dto.pinCode())));
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
}
