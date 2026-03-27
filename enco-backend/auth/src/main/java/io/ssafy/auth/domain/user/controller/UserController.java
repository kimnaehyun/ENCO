package io.ssafy.auth.domain.user.controller;

import io.ssafy.auth.domain.group.dto.response.MyGroupResponseDto;
import io.ssafy.auth.domain.group.service.GroupInfoService;
import io.ssafy.auth.domain.user.service.UserServiceImpl;
import io.ssafy.auth.global.common.response.CommonResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/users")
public class UserController {

    private GroupInfoService groupInfoService;
    private UserServiceImpl userService;

    /**
     * 내 모임(대표카드) 전체 목록 조회
     * @param userId
     * @return
     */
    @GetMapping("/me/groups")
    public ResponseEntity<CommonResponse<List<MyGroupResponseDto>>> getMyGroups(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(CommonResponse.success(groupInfoService.getMyGroups(userId)));
    }

    @PutMapping("/fcm-token")
    public ResponseEntity<CommonResponse<Void>> updateFcmToken(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody Map<String, String> body) {
        userService.updateFcmToken(userId, body.get("fcmToken"));
        return ResponseEntity.ok(CommonResponse.success(null));
    }

    @GetMapping("/internal/{userId}/fcm-token")
    public ResponseEntity<CommonResponse<String>> getFcmToken(@PathVariable Long userId) {
        return ResponseEntity.ok(CommonResponse.success(userService.getFcmToken(userId)));
    }

    @GetMapping("/internal/batch")
    public ResponseEntity<CommonResponse<List<UserDetailDto>>> getUserDetails(@RequestParam List<Long> userIds) {
        List<UserDetailDto> result = userService.getUsersByIds(userIds).stream()
                .map(u -> new UserDetailDto(u.getId(), u.getName(), u.getProfileUrl()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(CommonResponse.success(result));
    }

    public record UserDetailDto(Long userId, String name, Integer profileImage) {}

}
