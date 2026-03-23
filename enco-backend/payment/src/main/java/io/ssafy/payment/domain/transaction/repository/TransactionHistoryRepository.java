package io.ssafy.payment.domain.transaction.repository;

import io.ssafy.payment.domain.transaction.entity.Direction;
import io.ssafy.payment.domain.transaction.entity.TransactionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, Long> {

    boolean existsByIdempotencyKey(String idempotencyKey);

    // LATEST(DESC) - cursor 이전 항목
    @Query("""
            SELECT t FROM TransactionHistory t
            WHERE t.accountId = :accountId
              AND t.isDeleted = false
              AND (:direction IS NULL OR t.direction = :direction)
              AND (:startDate IS NULL OR t.createdAt >= :startDate)
              AND (:endDate IS NULL OR t.createdAt <= :endDate)
              AND (:cursor IS NULL OR t.createdAt < :cursor)
            ORDER BY t.createdAt DESC
            LIMIT :size
            """)
    List<TransactionHistory> findLatestWithCursor(
            @Param("accountId") Long accountId,
            @Param("direction") Direction direction,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("cursor") LocalDateTime cursor,
            @Param("size") int size
    );

    // OLDEST(ASC) - cursor 이후 항목
    @Query("""
            SELECT t FROM TransactionHistory t
            WHERE t.accountId = :accountId
              AND t.isDeleted = false
              AND (:direction IS NULL OR t.direction = :direction)
              AND (:startDate IS NULL OR t.createdAt >= :startDate)
              AND (:endDate IS NULL OR t.createdAt <= :endDate)
              AND (:cursor IS NULL OR t.createdAt > :cursor)
            ORDER BY t.createdAt ASC
            LIMIT :size
            """)
    List<TransactionHistory> findOldestWithCursor(
            @Param("accountId") Long accountId,
            @Param("direction") Direction direction,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("cursor") LocalDateTime cursor,
            @Param("size") int size
    );
}
