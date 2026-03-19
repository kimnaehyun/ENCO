package io.ssafy.payment.domain.account.repository;

import io.ssafy.payment.domain.account.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    @Query("SELECT a.amount FROM accounts a WHERE a.groupId = :groupId AND a.isDeleted = false")
    Optional<BigDecimal> findAmountByGroupId(@Param("groupId") Long groupId);
}
