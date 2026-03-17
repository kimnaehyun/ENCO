package io.ssafy.payment.domain.billing.controller;

import io.ssafy.payment.domain.billing.dto.response.DashboardReportResponseDto;
import io.ssafy.payment.domain.billing.dto.response.GroupDashboardResponseDto;
import io.ssafy.payment.domain.billing.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.RequestEntity;
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
    public ResponseEntity<GroupDashboardResponseDto> getDashboard(
            @PathVariable Long groupId) {

        return ResponseEntity.ok(dashboardService.getDashboard(groupId));
    }

    @GetMapping("/{groupId}/dashboard/report")
    public ResponseEntity<DashboardReportResponseDto> getDashboardReport(@PathVariable Long groupId) {

        DashboardReportResponseDto response = DashboardReportResponseDto.builder()
                .groupId(groupId)
                .balance(854440L)
                .paidAmount(854000L)
                .pointAmount(443L)
                .build();

        return ResponseEntity.ok(response);
    }
}