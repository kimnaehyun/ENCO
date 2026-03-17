package io.ssafy.auth.domain.group.repository;

import io.ssafy.auth.domain.group.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {

    boolean existsByIdAndIsDeletedFalse(Long id);
}
