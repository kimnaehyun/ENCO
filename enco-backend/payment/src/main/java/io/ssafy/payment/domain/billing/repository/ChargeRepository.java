package io.ssafy.payment.domain.billing.repository;

import io.ssafy.payment.domain.billing.entity.Charge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChargeRepository extends JpaRepository<Charge, Long> {

    Optional<Charge> findByExpenseId(Long expenseId);
}
