package io.ssafy.payment.domain.account.repository;

import io.ssafy.payment.domain.account.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
