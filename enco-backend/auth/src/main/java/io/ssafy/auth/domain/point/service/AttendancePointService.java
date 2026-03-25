package io.ssafy.auth.domain.point.service;



import io.ssafy.auth.domain.group.entity.Group;
import io.ssafy.auth.domain.group.repository.GroupRepository;
import io.ssafy.auth.domain.group.repository.GroupUserRepository;
import io.ssafy.auth.domain.point.dto.response.AttendanceCheckResponseDto;
import io.ssafy.auth.domain.point.dto.response.AttendanceDetailResponseDto;
import io.ssafy.auth.domain.point.entity.*;
import io.ssafy.auth.domain.point.repository.AttendanceEventRepository;
import io.ssafy.auth.domain.point.repository.AttendanceRepository;
import io.ssafy.auth.domain.point.repository.PointHistoryRepository;
import io.ssafy.auth.global.common.error.CustomException;
import io.ssafy.auth.global.common.error.ErrorCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendancePointService {

    private final GroupRepository groupRepository;
    private final AttendanceEventRepository eventRepository;
    private final AttendanceRepository attendanceRepository;
    private final PointHistoryRepository pointHistoryRepository;
    private final GroupUserRepository groupUserRepository;

    public BigDecimal getGroupPoint(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_GROUP));
        log.info("그룹 포인트 = {}", group.getPoint());
        return group.getPoint();
    }

    @Transactional
    public boolean togglePointUsage(Long groupId, boolean status) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_GROUP));

        group.togglePoint(status);
        log.info("포인트 사용 유무= {}", status);
        return group.isPointEnabled();
    }

    @Transactional
    public AttendanceCheckResponseDto attend(Long userId, Long groupId) {

        AttendanceEvent event = eventRepository.findByStatus(EventStatus.ACTIVE)
                .orElseThrow(() -> new CustomException(ErrorCode.NO_ACTIVE_EVENT));

        LocalTime nowTime = LocalTime.now();
        LocalDate nowDate = LocalDate.now();

        if (nowDate.isBefore(event.getStartDate()) || nowDate.isAfter(event.getEndDate()) ||
                nowTime.isBefore(event.getStartTime()) || nowTime.isAfter(event.getEndTime())) {
            throw new CustomException(ErrorCode.INVALID_ATTENDANCE_TIME);
        }

        int totalMembers = getGroupMemberCount(groupId); // ⭐️ 현재 모임의 총 인원수 가져오기

        if (event.getMinLimit() != null && totalMembers < event.getMinLimit()) {
            throw new CustomException(ErrorCode.MIN_MEMBER_LIMIT_NOT_MET);
        }

        LocalDateTime startOfDay = nowDate.atStartOfDay();
        boolean alreadyAttended = attendanceRepository.existsByUserIdAndGroupIdAndEventIdAndAttendedAtAfter(
                userId, groupId, event.getId(), startOfDay);

        if (alreadyAttended) {
            throw new CustomException(ErrorCode.ALREADY_ATTENDED);
        }

        int previousAttendDays = attendanceRepository.findMaxAttendDays(userId, groupId, event.getId()).orElse(0);
        int currentAttendDays = previousAttendDays + 1;

        Attendance attendance = Attendance.builder()
                .userId(userId)
                .groupId(groupId)
                .event(event)
                .attendedAt(LocalDateTime.now())
                .attendDays(currentAttendDays)
                .build();

        Attendance savedAttendance = attendanceRepository.save(attendance);

        int todayAttendCount = attendanceRepository.countTodayAttendancesByGroupIdAndEventId(groupId, event.getId(), startOfDay);

        int targetRate = event.getTargetRate() != null ? event.getTargetRate() : 0;
        int targetMemberCount = (int) Math.ceil(totalMembers * (targetRate / 100.0));

        if (targetMemberCount > 0 && todayAttendCount == targetMemberCount) {
            Group group = groupRepository.findById(groupId).orElseThrow();
            group.addPoint(event.getRewardPoint());

            PointHistory history = PointHistory.builder()
                    .groupId(group.getId())
                    .eventId(event.getId())
                    .amount(event.getRewardPoint())
                    .balance(group.getPoint())
                    .direction(Direction.IN)
                    .description("출석 이벤트(" + event.getEventName() + ") 당일 목표 달성 보상")
                    .referenceId(savedAttendance.getId())
                    .build();
            pointHistoryRepository.save(history);
            log.info("[출석 리워드 지급] groupId={}, 오늘출석인원={}, 목표인원={}, amount={}",
                    group.getId(), todayAttendCount, targetMemberCount, event.getRewardPoint());
        }

        List<LocalDate> attendedDates = attendanceRepository.findAllByUserIdAndGroupIdAndEventIdOrderByAttendedAtAsc(userId, groupId, event.getId())
                .stream()
                .map(a -> a.getAttendedAt().toLocalDate())
                .distinct()
                .toList();

        int streakDays = calculateStreak(attendedDates);

        return new AttendanceCheckResponseDto(
                savedAttendance.getId(),
                savedAttendance.getAttendedAt().toLocalDate().toString(),
                attendedDates.size(),
                streakDays
        );
    }

    public AttendanceDetailResponseDto getMyAttendanceDetail(Long userId, Long groupId) {

        AttendanceEvent event = eventRepository.findByStatus(EventStatus.ACTIVE)
                .orElseThrow(() -> new CustomException(ErrorCode.NO_ACTIVE_EVENT));

        int totalMembers = getGroupMemberCount(groupId);

        List<Attendance> attendances = attendanceRepository.findAllByUserIdAndGroupIdAndEventIdOrderByAttendedAtAsc(userId, groupId, event.getId());
        Long lastAttendanceId = attendances.isEmpty() ? null : attendances.get(attendances.size() - 1).getId();
        long totalDays = ChronoUnit.DAYS.between(event.getStartDate(), event.getEndDate()) + 1;

        List<LocalDate> attendedDates = attendances.stream()
                .map(a -> a.getAttendedAt().toLocalDate())
                .distinct()
                .toList();

        List<String> stamps = attendedDates.stream().map(LocalDate::toString).toList();
        int streakDays = calculateStreak(attendedDates);

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        int currentMemberCount = attendanceRepository.countTodayAttendancesByGroupIdAndEventId(groupId, event.getId(), startOfDay);

        int targetRate = event.getTargetRate() != null ? event.getTargetRate() : 0;
        int targetMemberCount = (int) Math.ceil(totalMembers * (targetRate / 100.0));

        AttendanceDetailResponseDto.EventInfoDto eventInfoDto = new AttendanceDetailResponseDto.EventInfoDto(
                event.getId(),
                event.getEventName(),
                event.getDescription(),
                event.getStartDate().toString(),
                event.getEndDate().toString(),
                event.getStartTime().toString(),
                event.getEndTime().toString(),
                totalDays,
                targetMemberCount,
                currentMemberCount
        );

        return new AttendanceDetailResponseDto(
                lastAttendanceId, eventInfoDto, stamps.size(), streakDays, stamps
        );
    }

    private int getGroupMemberCount(Long groupId) {
         return groupUserRepository.countByGroupId(groupId);
    }

    private int calculateStreak(List<LocalDate> dates) {
        if (dates == null || dates.isEmpty()) {
            return 0;
        }

        int streak = 0;
        LocalDate today = LocalDate.now();
        LocalDate lastDate = dates.get(dates.size() - 1); // 가장 최근 출석일

        if (lastDate.isEqual(today) || lastDate.isEqual(today.minusDays(1))) {
            streak = 1;
            LocalDate currentDateToCheck = lastDate;

            for (int i = dates.size() - 2; i >= 0; i--) {
                LocalDate prevDate = dates.get(i);

                if (prevDate.isEqual(currentDateToCheck.minusDays(1))) {
                    streak++;
                    currentDateToCheck = prevDate;
                } else {
                    break;
                }
            }
        }
        return streak;
    }
}