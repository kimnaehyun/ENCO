package io.ssafy.payment.domain.vote.repository;

import io.lettuce.core.dynamic.annotation.Param;
import io.ssafy.payment.domain.vote.entity.PaymentVote;
import io.ssafy.payment.domain.vote.entity.VoteStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PaymentVoteRepository extends JpaRepository<PaymentVote, Long> {
    List<PaymentVote> findByStatusAndExpiredAtBefore(VoteStatus status, LocalDateTime now);
    List<PaymentVote> findByGroupId(Long groupId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM PaymentVote v WHERE v.id = :id")
    Optional<PaymentVote> findByIdWithPessimisticLock(@Param("id") Long id);
}
