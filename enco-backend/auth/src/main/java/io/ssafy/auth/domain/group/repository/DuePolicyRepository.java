package io.ssafy.auth.domain.group.repository;

import io.ssafy.auth.domain.group.entity.DuePolicy;
import io.ssafy.auth.domain.group.entity.DuePolicyStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DuePolicyRepository extends JpaRepository<DuePolicy, Long> {

    Optional<DuePolicy> findByGroupIdAndIsDeletedFalseAndStatus(Long groupId, DuePolicyStatus status);
}
