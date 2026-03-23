package io.ssafy.payment.domain.account.repository;

import io.ssafy.payment.domain.account.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByGroupIdAndIsDeletedFalse(Long groupId);

    @Query("SELECT a.amount FROM accounts a WHERE a.groupId = :groupId AND a.isDeleted = false")
    Optional<BigDecimal> findAmountByGroupId(@Param("groupId") Long groupId);

    @Modifying
    @Query("UPDATE accounts a SET a.amount = a.amount + :amount WHERE a.groupId = :groupId AND a.isDeleted = false")
    int depositByGroupId(@Param("groupId") Long groupId, @Param("amount") BigDecimal amount);

    @Query("""
    SELECT DISTINCT a FROM accounts a
    LEFT JOIN FETCH a.cardList c
    WHERE a.id IN :accountIds
      AND a.isDeleted = false
    """)
    List<Account> findByIdInWithBasicCard(@Param("accountIds") List<Long> accountIds);

    Optional<Account> findByGroupId(Long aLong);
}
