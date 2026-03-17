package io.ssafy.auth.domain.user.controller;

import io.ssafy.auth.domain.user.dto.request.LoginRequestDto;
import io.ssafy.auth.domain.user.dto.request.UserJoinRequestDto;
import io.ssafy.auth.domain.user.dto.response.LoginResponseDto;
import io.ssafy.auth.domain.user.dto.response.UserJoinResponseDto;
import io.ssafy.auth.domain.user.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/auth")
public class UserController {
    private UserService userService;

    @PostMapping("/regist")
    public ResponseEntity<LoginResponseDto> signUp(@RequestBody UserJoinRequestDto dto) throws Exception {
        UserJoinResponseDto joinDto = userService.signup(dto);
        return ResponseEntity.ok(userService.login(joinDto.deviceToken(), dto.pinCode()));
    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto loginRequestDto) throws Exception {
        LoginResponseDto responseDto = userService.login(
                loginRequestDto.deviceToken(),
                loginRequestDto.pinCode()
        );
        return ResponseEntity.ok(responseDto);
    }
}
