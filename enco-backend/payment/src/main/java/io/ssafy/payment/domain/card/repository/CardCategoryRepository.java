package io.ssafy.payment.domain.card.repository;

import io.ssafy.payment.domain.card.entity.CardCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardCategoryRepository extends JpaRepository<CardCategory, Long> {
}