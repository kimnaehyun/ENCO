package io.ssafy.payment.domain.card.repository;

import io.ssafy.payment.domain.card.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    Optional<Card> findFirstByAccount_GroupIdAndIsBasicTrueAndIsDeletedFalse(Long groupId);
    List<Card> findByAccount_GroupIdAndIsDeletedFalseOrderByIsBasicDesc(Long groupId);
}