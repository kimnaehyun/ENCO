package io.ssafy.auth.domain.group.controller;

import io.ssafy.auth.domain.group.dto.request.CreateDuePolicyRequestDto;
import io.ssafy.auth.domain.group.dto.response.DuePolicyResponseDto;
import io.ssafy.auth.domain.group.service.DuePolicyService;
import io.ssafy.auth.global.common.response.CommonResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
public class DuePolicyController {

    private final DuePolicyService duePolicyService;

    @PostMapping("/{groupId}/due-policies")
    public ResponseEntity<CommonResponse<DuePolicyResponseDto>> createPolicy(
            @PathVariable Long groupId,
            @Valid @RequestBody CreateDuePolicyRequestDto request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonResponse.success(duePolicyService.createPolicy(groupId, request)));
    }

    @DeleteMapping("/{groupId}/due-policies")
    public ResponseEntity<CommonResponse<Void>> deactivatePolicy(@PathVariable Long groupId) {
        duePolicyService.deactivatePolicy(groupId);
        return ResponseEntity.ok(CommonResponse.success());
    }
}
