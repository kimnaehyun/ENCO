package io.ssafy.travel.domain.product.respository;

import io.ssafy.travel.domain.product.entity.TravelProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TravelProductRepository extends JpaRepository<TravelProduct, Long> {
    List<TravelProduct> findAllByIsDeletedFalse();

    Optional<TravelProduct> findByIdAndIsDeletedFalse(Long id);
}
