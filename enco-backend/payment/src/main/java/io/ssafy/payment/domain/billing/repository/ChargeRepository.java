package io.ssafy.payment.domain.billing.repository;

import io.ssafy.payment.domain.billing.entity.Charge;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChargeRepository extends JpaRepository<Charge, Long> {
}
