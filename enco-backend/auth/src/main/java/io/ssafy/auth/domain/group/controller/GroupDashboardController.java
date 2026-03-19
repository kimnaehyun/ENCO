package io.ssafy.auth.domain.group.controller;

import io.ssafy.auth.domain.group.dto.response.GroupDashboardResponseDto;
import io.ssafy.auth.domain.group.service.GroupDashboardService;
import io.ssafy.auth.global.common.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
public class GroupDashboardController {

    private final GroupDashboardService groupDashboardService;

    @GetMapping("/{groupId}/dashboard")
    public ResponseEntity<CommonResponse<GroupDashboardResponseDto>> getDashboardInfo(
            @PathVariable Long groupId
    ) {
        return ResponseEntity.ok(CommonResponse.success(groupDashboardService.getDashboardInfo(groupId)));
    }
}
