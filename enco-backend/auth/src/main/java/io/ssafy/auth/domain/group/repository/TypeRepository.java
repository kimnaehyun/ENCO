package io.ssafy.auth.domain.group.repository;

import io.ssafy.auth.domain.group.entity.Type;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TypeRepository extends JpaRepository<Type, Long> {
}
