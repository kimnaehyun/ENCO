package io.ssafy.payment.domain.vote.repository;

import io.ssafy.payment.domain.vote.entity.PaymentVote;
import io.ssafy.payment.domain.vote.entity.VoteStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface PaymentVoteRepository extends JpaRepository<PaymentVote, Long> {
    List<PaymentVote> findByGroupIdAndStatusAndExpiredAtAfter(Long groupId,VoteStatus status,LocalDateTime now);
    List<PaymentVote> findByStatusAndExpiredAtBefore(VoteStatus status, LocalDateTime now);
    List<PaymentVote> findAllByGroupIdOrderByIdDesc(Long groupId); // (선택: 최신순 정렬)

    List<PaymentVote> findByGroupId(Long groupId);
}
