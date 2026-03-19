package io.ssafy.payment.domain.card.repository;


import io.ssafy.payment.domain.card.entity.CardBenefit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardBenefitRepository extends JpaRepository<CardBenefit, Long> {
}