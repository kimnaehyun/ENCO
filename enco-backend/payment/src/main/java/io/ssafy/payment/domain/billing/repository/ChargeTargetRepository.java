package io.ssafy.payment.domain.billing.repository;

import io.ssafy.payment.domain.billing.entity.ChargeTarget;
import io.ssafy.payment.domain.billing.entity.ChargeTargetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChargeTargetRepository extends JpaRepository<ChargeTarget, Long> {

    List<ChargeTarget> findByCharge_IdAndIsDeletedFalse(Long chargeId);

    List<ChargeTarget> findByUserIdAndCharge_GroupIdAndStatusInAndIsDeletedFalse(
            Long userId, Long groupId, List<ChargeTargetStatus> statuses);

    List<ChargeTarget> findByUserIdAndCharge_GroupIdAndStatusInAndIsDeletedFalseOrderByCreatedAtAsc(
            Long userId, Long groupId, List<ChargeTargetStatus> statuses);

    boolean existsByCharge_IdAndStatusNotAndIsDeletedFalse(Long chargeId, ChargeTargetStatus status);

    @Query("SELECT COUNT(DISTINCT ct.userId) FROM ChargeTarget ct WHERE ct.charge.groupId = :groupId AND ct.status IN :statuses AND ct.isDeleted = false")
    long countDistinctUnpaidUsersByGroupId(@Param("groupId") Long groupId, @Param("statuses") List<ChargeTargetStatus> statuses);

    @Query("SELECT COUNT(DISTINCT ct.userId) FROM ChargeTarget ct WHERE ct.charge.groupId = :groupId AND ct.isDeleted = false AND ct.userId NOT IN (SELECT ct2.userId FROM ChargeTarget ct2 WHERE ct2.charge.groupId = :groupId AND ct2.status IN :statuses AND ct2.isDeleted = false)")
    long countDistinctPaidUsersByGroupId(@Param("groupId") Long groupId, @Param("statuses") List<ChargeTargetStatus> statuses);
}
