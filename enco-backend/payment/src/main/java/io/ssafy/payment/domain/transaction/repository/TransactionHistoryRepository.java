package io.ssafy.payment.domain.transaction.repository;

import io.ssafy.payment.domain.transaction.entity.TransactionHistory;
import io.ssafy.payment.domain.vote.entity.PaymentVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, Long> {
    Optional<TransactionHistory> findByVoteId(Long voteId);
}
