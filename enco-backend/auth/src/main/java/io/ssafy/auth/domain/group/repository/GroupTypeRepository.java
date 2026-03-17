package io.ssafy.auth.domain.group.repository;

import io.ssafy.auth.domain.group.entity.GroupType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupTypeRepository extends JpaRepository<GroupType, Long> {
}
