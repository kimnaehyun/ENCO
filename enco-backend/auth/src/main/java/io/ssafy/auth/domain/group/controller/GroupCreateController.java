package io.ssafy.auth.domain.group.controller;

import io.ssafy.auth.domain.group.dto.request.GroupAccountCreateRequestDto;
import io.ssafy.auth.domain.group.dto.response.GroupAccountCreateResponseDto;
import io.ssafy.auth.domain.group.dto.response.TypeResponseDto;
import io.ssafy.auth.domain.group.service.GroupCreateService;
import io.ssafy.auth.global.common.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
public class GroupCreateController {
    private final GroupCreateService groupCreateService;

    /**
     * 모임 성향 리스트 조회
     * @return
     */
    @GetMapping("/types")
    public ResponseEntity<CommonResponse<List<TypeResponseDto>>> typeList() {
        return ResponseEntity.ok(CommonResponse.success(groupCreateService.typeList()));
    }

    /**
     * 모임 성향 등록
     * @param typeName
     * @return
     */
    @PostMapping("/types")
    public ResponseEntity<CommonResponse<Void>> createType(@RequestParam("typeName") String typeName) {
        groupCreateService.createType(typeName);
        return ResponseEntity.ok().build();
    }

    /**
     * 모임 통장 통합 개설
     * @param userId
     * @param request
     * @return
     */
    @PostMapping("/account")
    public ResponseEntity<CommonResponse<GroupAccountCreateResponseDto>> createGroupAccount(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody GroupAccountCreateRequestDto request) {

        GroupAccountCreateResponseDto result = groupCreateService.createGroupAccount(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(CommonResponse.success(result));
    }
}

