package io.ssafy.auth.domain.point.controller;


import io.ssafy.auth.domain.point.dto.response.AttendanceCheckResponseDto;
import io.ssafy.auth.domain.point.dto.response.AttendanceDetailResponseDto;
import io.ssafy.auth.domain.point.service.AttendancePointService;
import io.ssafy.auth.global.common.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class GroupPointController {

    private final AttendancePointService pointService;

    @GetMapping("/{groupId}/points")
    public ResponseEntity<CommonResponse<BigDecimal>> getGroupPoints(@PathVariable Long groupId) {
        BigDecimal points = pointService.getGroupPoint(groupId);
        log.info("[GroupPoint] 포인트 조회 성공: groupId={}, points={}", groupId, points);

        return ResponseEntity.ok(CommonResponse.success(points));
    }
    @PatchMapping("/{groupId}/points/toggle")
    public ResponseEntity<CommonResponse<Boolean>> togglePointUsage(
            @PathVariable Long groupId,
            @RequestParam boolean status) {

        boolean updatedStatus = pointService.togglePointUsage(groupId, status);
        log.info("[GroupPoint] 포인트 상태 변경: groupId={}, status={}", groupId, updatedStatus);

        return ResponseEntity.ok(CommonResponse.success(updatedStatus));
    }

    @PostMapping("/{groupId}/attend")
    public ResponseEntity<CommonResponse<AttendanceCheckResponseDto>> attendEvent(
            @RequestHeader("X-User-Id") Long userId, // 게이트웨이가 파싱해준 유저 ID
            @PathVariable Long groupId) {

        AttendanceCheckResponseDto responseDto = pointService.attend(userId, groupId);
        log.info("[Attendance] 출석 완료: groupId={}, userId={}", groupId, userId);

        return ResponseEntity.ok(CommonResponse.success(responseDto));
    }

    @GetMapping("/{groupId}/attendances")
    public ResponseEntity<CommonResponse<AttendanceDetailResponseDto>> getMyAttendanceDetail(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long groupId) {

        AttendanceDetailResponseDto responseDto = pointService.getMyAttendanceDetail(userId, groupId);

        log.info("[Attendance] 출석 내역 상세 조회 완료: groupId={}, userId={}, 도장개수={}",
                groupId, userId, responseDto.totalAttendanceInEvent());

        return ResponseEntity.ok(CommonResponse.success(responseDto));
    }
}