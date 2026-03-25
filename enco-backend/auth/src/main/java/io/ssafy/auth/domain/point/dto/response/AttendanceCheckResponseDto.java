package io.ssafy.auth.domain.point.dto.response;

public record AttendanceCheckResponseDto(
        Long attendanceId,
        String attendedAt,
        int totalAttendanceInEvent,
        int streakDays,
        boolean isRewardGranted
) {}