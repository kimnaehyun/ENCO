package io.ssafy.payment.domain.card.repository;

import io.lettuce.core.dynamic.annotation.Param;
import io.ssafy.payment.domain.card.entity.CardProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CardProductRepository extends JpaRepository<CardProduct, Long> {
    List<CardProduct> findAllByIsDeletedFalse();
    Optional<CardProduct> findByIdAndIsDeletedFalse(Long id);

    @Query("SELECT c FROM CardProduct c " +
            "JOIN CardBenefit b ON b.cardProduct.id = c.id " +
            "JOIN b.category cat " +
            "WHERE cat.name IN :categoryName " +
            "ORDER BY b.discountRate DESC")
    List<CardProduct> findRecommendedCards(@Param("categoryName") List<String> categoryName);
}