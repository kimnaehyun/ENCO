package io.ssafy.payment.domain.transaction.repository;

import io.ssafy.payment.domain.transaction.entity.TransactionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, Long> {
    boolean existsByIdempotencyKey(String idempotencyKey);
}
