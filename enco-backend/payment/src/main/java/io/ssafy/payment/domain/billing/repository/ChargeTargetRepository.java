package io.ssafy.payment.domain.billing.repository;

import io.ssafy.payment.domain.billing.entity.ChargeTarget;
import io.ssafy.payment.domain.billing.entity.ChargeTargetStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChargeTargetRepository extends JpaRepository<ChargeTarget, Long> {

    List<ChargeTarget> findByCharge_IdAndIsDeletedFalse(Long chargeId);

    List<ChargeTarget> findByUserIdAndCharge_GroupIdAndStatusInAndIsDeletedFalse(
            Long userId, Long groupId, List<ChargeTargetStatus> statuses);
}
