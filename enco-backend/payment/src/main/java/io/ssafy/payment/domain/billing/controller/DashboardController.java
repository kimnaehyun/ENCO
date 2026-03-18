package io.ssafy.payment.domain.billing.controller;

import io.ssafy.payment.domain.billing.dto.response.DashboardReportResponseDto;
import io.ssafy.payment.domain.billing.dto.response.GroupDashboardResponseDto;
import io.ssafy.payment.domain.billing.service.DashboardService;
import io.ssafy.payment.global.common.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/groups")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/{groupId}/dashboard")
    public ResponseEntity<CommonResponse<GroupDashboardResponseDto>> getDashboard(
            @PathVariable Long groupId) {

        return ResponseEntity.ok(CommonResponse.success(dashboardService.getDashboard(groupId)));
    }

    @GetMapping("/{groupId}/dashboard/report")
    public ResponseEntity<CommonResponse<DashboardReportResponseDto>> getDashboardReport(@PathVariable Long groupId) {

        DashboardReportResponseDto response = DashboardReportResponseDto.builder()
                .groupId(groupId)
                .balance(854440L)
                .paidAmount(854000L)
                .pointAmount(443L)
                .build();

        return ResponseEntity.ok(CommonResponse.success(response));
    }
}