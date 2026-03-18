package io.ssafy.auth.domain.group.controller;

import io.ssafy.auth.domain.group.dto.request.UpdateMemberRoleRequestDto;
import io.ssafy.auth.domain.group.dto.response.GroupMemberResponseDto;
import io.ssafy.auth.domain.group.service.GroupMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
public class GroupMemberController {

    private final GroupMemberService groupMemberService;

    @GetMapping("/{groupId}/members")
    public ResponseEntity<List<GroupMemberResponseDto>> getActiveMembers(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupMemberService.getActiveMembers(groupId));
    }

    @PatchMapping("/{groupId}/members/{targetUserId}/role")
    public ResponseEntity<Void> updateMemberRole(
            @PathVariable Long groupId,
            @PathVariable Long targetUserId,
            @RequestHeader("X-User-Id")  Long requesterId,
            @Valid @RequestBody UpdateMemberRoleRequestDto request
    ) {
        groupMemberService.updateMemberRole(groupId, requesterId, targetUserId, request);
        return ResponseEntity.noContent().build();
    }
}
