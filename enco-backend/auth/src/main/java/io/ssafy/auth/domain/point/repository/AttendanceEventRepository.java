package io.ssafy.auth.domain.point.repository;

import io.ssafy.auth.domain.point.entity.AttendanceEvent;
import io.ssafy.auth.domain.point.entity.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AttendanceEventRepository extends JpaRepository<AttendanceEvent, Long> {
    Optional<AttendanceEvent> findByGroupIdAndStatus(Long groupId, EventStatus status);
}
