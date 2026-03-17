package io.ssafy.payment.domain.billing.repository;

import io.ssafy.payment.domain.billing.entity.DuePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DuePaymentRepository extends JpaRepository<DuePayment, Long> {

    @Query("""
        SELECT 
            SUM(CASE WHEN p.status = 'SUCCESS' THEN 1 ELSE 0 END)
        FROM DuePayment p
        WHERE p.groupId = :groupId
    """)
    Object[] countPaymentStatus(@Param("groupId") Long groupId);

//    @Query("""
//    SELECT COALESCE(SUM(
//        CASE
//            WHEN t.direction = 'IN' THEN t.amount
//            WHEN t.direction = 'OUT' THEN -t.amount
//            ELSE 0
//        END
//    ), 0)
//    FROM TransactionHistory t
//    WHERE t.groupId = :groupId
//""")
//    Long findGroupBalance(@Param("groupId") Long groupId);
}