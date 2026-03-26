package io.ssafy.auth.domain.point.repository;

import io.lettuce.core.dynamic.annotation.Param;
import io.ssafy.auth.domain.point.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    boolean existsByUserIdAndGroupIdAndEventIdAndAttendedAtAfter(Long userId, Long groupId, Long eventId, LocalDateTime startOfDay);

    @Query("SELECT MAX(a.attendDays) FROM Attendance a WHERE a.userId = :userId AND a.groupId = :groupId AND a.event.id = :eventId")
    Optional<Integer> findMaxAttendDays(@Param("userId") Long userId, @Param("groupId") Long groupId, @Param("eventId") Long eventId);

    @Query("SELECT COUNT(DISTINCT a.userId) FROM Attendance a WHERE a.groupId = :groupId AND a.event.id = :eventId AND a.attendedAt >= :startOfDay")
    int countTodayAttendancesByGroupIdAndEventId(@Param("groupId") Long groupId, @Param("eventId") Long eventId, @Param("startOfDay") LocalDateTime startOfDay);

    List<Attendance> findAllByUserIdAndGroupIdAndEventIdOrderByAttendedAtAsc(Long userId, Long groupId, Long eventId);
}