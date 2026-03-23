package io.ssafy.payment.domain.vote.repository;


import io.ssafy.payment.domain.vote.entity.PaymentVote;
import io.ssafy.payment.domain.vote.entity.PaymentVoteHistory;
import io.ssafy.payment.domain.vote.entity.VoteChoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentVoteHistoryRepository extends JpaRepository<PaymentVoteHistory, Long> {
    List<PaymentVoteHistory> findByVote(PaymentVote vote);

    boolean existsByVoteAndUserId(PaymentVote vote, Long userId);

    int countByVoteAndChoice(PaymentVote vote, VoteChoice choice);
}