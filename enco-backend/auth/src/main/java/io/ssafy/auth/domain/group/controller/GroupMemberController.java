package io.ssafy.auth.domain.group.controller;

import io.ssafy.auth.domain.group.dto.response.GroupMemberResponseDto;
import io.ssafy.auth.domain.group.service.GroupMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
