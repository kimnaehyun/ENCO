package io.ssafy.auth.domain.group.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Type extends JpaRepository<Type, Long> {
}
