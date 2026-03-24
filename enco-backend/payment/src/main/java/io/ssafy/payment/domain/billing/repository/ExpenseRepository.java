package io.ssafy.payment.domain.billing.repository;

import io.ssafy.payment.domain.billing.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // LATEST(DESC)
    @Query("""
            SELECT e FROM Expense e
            WHERE e.groupId = :groupId
              AND e.isDeleted = false
              AND (:startDate IS NULL OR e.createdAt >= :startDate)
              AND (:endDate IS NULL OR e.createdAt <= :endDate)
              AND (:cursor IS NULL OR e.createdAt < :cursor)
            ORDER BY e.createdAt DESC
            LIMIT :size
            """)
    List<Expense> findLatestWithCursor(
            @Param("groupId") Long groupId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("cursor") LocalDateTime cursor,
            @Param("size") int size
    );

    // OLDEST(ASC)
    @Query("""
            SELECT e FROM Expense e
            WHERE e.groupId = :groupId
              AND e.isDeleted = false
              AND (:startDate IS NULL OR e.createdAt >= :startDate)
              AND (:endDate IS NULL OR e.createdAt <= :endDate)
              AND (:cursor IS NULL OR e.createdAt > :cursor)
            ORDER BY e.createdAt ASC
            LIMIT :size
            """)
    List<Expense> findOldestWithCursor(
            @Param("groupId") Long groupId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("cursor") LocalDateTime cursor,
            @Param("size") int size
    );
}
