package io.ssafy.payment.domain.vote.repository;

import io.ssafy.payment.domain.vote.entity.PaymentVote;
import io.ssafy.payment.domain.vote.entity.VoteStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PaymentVoteRepository extends JpaRepository<PaymentVote, Long> {
    List<PaymentVote> findByGroupId(Long groupId);
    List<PaymentVote> findByGroupIdAndStatus(Long groupId, VoteStatus status);
    List<PaymentVote> findByStatusAndExpiredAtBefore(VoteStatus status, LocalDateTime now);
}
