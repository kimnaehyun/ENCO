package io.ssafy.auth.domain.group.controller;

import io.ssafy.auth.domain.group.entity.DuePolicy;
import io.ssafy.auth.domain.group.entity.DuePolicyStatus;
import io.ssafy.auth.domain.group.repository.DuePolicyRepository;
import io.ssafy.auth.global.common.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/internal/due-policies")
@RequiredArgsConstructor
public class DuePolicyInternalController {

    private final DuePolicyRepository duePolicyRepository;

    @GetMapping("/today")
    public ResponseEntity<CommonResponse<List<ActiveDuePolicyDto>>> getTodayActivePolicies() {
        int today = LocalDate.now().getDayOfMonth();
        List<DuePolicy> policies = duePolicyRepository.findByDayOfMonthAndStatusAndIsDeletedFalse(today, DuePolicyStatus.ACTIVE);
        List<ActiveDuePolicyDto> result = policies.stream()
                .map(p -> new ActiveDuePolicyDto(p.getId(), p.getGroupId(), p.getAmount()))
                .toList();
        return ResponseEntity.ok(CommonResponse.success(result));
    }

    public record ActiveDuePolicyDto(Long policyId, Long groupId, BigDecimal amount) {}
}
