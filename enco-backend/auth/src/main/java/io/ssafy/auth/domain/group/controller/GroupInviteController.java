package io.ssafy.auth.domain.group.controller;

import io.ssafy.auth.domain.group.dto.response.InviteLinkResponseDto;
import io.ssafy.auth.domain.group.service.GroupInviteService;
import io.ssafy.auth.global.common.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class GroupInviteController {

    private final GroupInviteService groupInviteService;

    @PostMapping("/groups/{groupId}/invite")
    public ResponseEntity<CommonResponse<InviteLinkResponseDto>> createInviteLink(
            @PathVariable Long groupId,
            @RequestHeader("X-User-Id") Long requesterId
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonResponse.success(groupInviteService.createInviteLink(groupId, requesterId)));
    }

    @PostMapping("/invite/{token}/join")
    public ResponseEntity<CommonResponse<Void>> joinGroup(
            @PathVariable String token,
            @RequestHeader("X-User-Id") Long userId
    ) {
        groupInviteService.joinGroup(token, userId);
        return ResponseEntity.ok(CommonResponse.success());
    }
}
