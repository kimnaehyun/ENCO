package io.ssafy.auth.domain.group.controller;

import io.ssafy.auth.domain.group.dto.request.UpdateGroupSettingRequestDto;
import io.ssafy.auth.domain.group.dto.response.GroupSettingResponseDto;
import io.ssafy.auth.domain.group.service.GroupSettingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
public class GroupSettingController {

    private final GroupSettingService groupSettingService;

    /*
    Todo: 추후 카드도 조회에 추가
     */
    @GetMapping("/{groupId}/settings")
    public ResponseEntity<GroupSettingResponseDto> getGroupSetting(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupSettingService.getGroupSetting(groupId));
    }

    @PatchMapping("/{groupId}/settings")
    public ResponseEntity<Void> updateGroupSetting(
            @PathVariable Long groupId,
            @Valid @RequestBody UpdateGroupSettingRequestDto request
    ) {
        groupSettingService.updateGroupSetting(groupId, request);
        return ResponseEntity.noContent().build();
    }
}
