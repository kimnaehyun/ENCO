package io.ssafy.payment.domain.billing.repository;

import io.ssafy.payment.domain.billing.entity.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {

    @Query("SELECT r FROM Receipt r LEFT JOIN FETCH r.items WHERE r.expenseId = :expenseId")
    Optional<Receipt> findByExpenseIdWithItems(@Param("expenseId") Long expenseId);

    Optional<Receipt> findTopByTransactionIdOrderByIdDesc(Long transactionId);
}
