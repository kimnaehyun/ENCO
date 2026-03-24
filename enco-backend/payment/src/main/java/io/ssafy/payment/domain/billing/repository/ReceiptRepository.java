package io.ssafy.payment.domain.billing.repository;

import io.ssafy.payment.domain.billing.entity.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
}
