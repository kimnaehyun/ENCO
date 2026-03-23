package io.ssafy.payment.domain.billing.repository;

import io.ssafy.payment.domain.billing.entity.UserPrepayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserPrepaymentRepository extends JpaRepository<UserPrepayment, Long> {

    Optional<UserPrepayment> findByUserIdAndGroupId(Long userId, Long groupId);
}
