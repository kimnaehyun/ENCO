package io.ssafy.payment.domain.card.repository;

import io.ssafy.payment.domain.card.entity.CardProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CardProductRepository extends JpaRepository<CardProduct, Long> {
    List<CardProduct> findAllByIsDeletedFalse();
    Optional<CardProduct> findByIdAndIsDeletedFalse(Long id);
}