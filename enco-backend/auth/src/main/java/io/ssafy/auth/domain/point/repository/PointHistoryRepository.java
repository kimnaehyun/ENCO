package io.ssafy.auth.domain.point.repository;

import io.ssafy.auth.domain.point.entity.Direction;
import io.ssafy.auth.domain.point.entity.PointHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PointHistoryRepository extends JpaRepository<PointHistory, Long> {

    @Query("SELECT p FROM PointHistory p WHERE p.groupId = :groupId AND (:direction IS NULL OR p.direction = :direction) AND (:cursor IS NULL OR p.createdAt < :cursor) ORDER BY p.createdAt DESC LIMIT :size")
    List<PointHistory> findLatestWithCursor(@Param("groupId") Long groupId, @Param("direction") Direction direction, @Param("cursor") LocalDateTime cursor, @Param("size") int size);

    @Query("SELECT p FROM PointHistory p WHERE p.groupId = :groupId AND (:direction IS NULL OR p.direction = :direction) AND (:cursor IS NULL OR p.createdAt > :cursor) ORDER BY p.createdAt ASC LIMIT :size")
    List<PointHistory> findOldestWithCursor(@Param("groupId") Long groupId, @Param("direction") Direction direction, @Param("cursor") LocalDateTime cursor, @Param("size") int size);
}
