package io.ssafy.payment.domain.billing.repository;

import io.ssafy.payment.domain.billing.entity.DuePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DuePaymentRepository extends JpaRepository<DuePayment, Long> {

    @Query("""
        SELECT 
            SUM(CASE WHEN p.status = 'PAID' THEN 1 ELSE 0 END),
            SUM(CASE WHEN p.status = 'UNPAID' THEN 1 ELSE 0 END)
        FROM DuePayment p
        WHERE p.groupId = :groupId
    """)
    Object[] countPaymentStatus(@Param("groupId") Long groupId);
}