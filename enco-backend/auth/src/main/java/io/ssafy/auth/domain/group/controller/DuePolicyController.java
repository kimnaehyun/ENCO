package io.ssafy.auth.domain.group.controller;

import io.ssafy.auth.domain.group.dto.request.CreateDuePolicyRequestDto;
import io.ssafy.auth.domain.group.dto.response.DuePolicyResponseDto;
import io.ssafy.auth.domain.group.service.DuePolicyService;
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
    public ResponseEntity<DuePolicyResponseDto> createPolicy(
            @PathVariable Long groupId,
            @Valid @RequestBody CreateDuePolicyRequestDto request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(duePolicyService.createPolicy(groupId, request));
    }

    @DeleteMapping("/{groupId}/due-policies")
    public ResponseEntity<Void> deactivatePolicy(@PathVariable Long groupId) {
        duePolicyService.deactivatePolicy(groupId);
        return ResponseEntity.noContent().build();
    }
}
