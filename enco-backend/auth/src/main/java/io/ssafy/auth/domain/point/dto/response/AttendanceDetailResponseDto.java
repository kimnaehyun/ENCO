package io.ssafy.auth.domain.point.dto.response;

import java.math.BigDecimal;
import java.util.List;


public record AttendanceDetailResponseDto(
        Long attendanceId,
        EventInfoDto event,
        int totalAttendanceInEvent,
        int streakDays,
        List<String> stamps
) {
    public record EventInfoDto(
            Long eventId,
            String name,
            String description,
            String startDate,
            String endDate,
            String startTime,
            String endTime,
            BigDecimal rewardPoint,
            long totalDays,

            Integer targetMemberCount,
            Integer currentMemberCount
    ) {}
}