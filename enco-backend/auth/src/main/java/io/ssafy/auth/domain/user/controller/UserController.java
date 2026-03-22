package io.ssafy.auth.domain.user.controller;

import io.ssafy.auth.domain.group.dto.response.MyGroupResponseDto;
import io.ssafy.auth.domain.group.service.GroupInfoService;
import io.ssafy.auth.global.common.response.CommonResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/users")
public class UserController {

    private GroupInfoService groupInfoService;

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
}
