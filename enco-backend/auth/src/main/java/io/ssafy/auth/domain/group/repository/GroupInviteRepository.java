package io.ssafy.auth.domain.group.repository;

import io.ssafy.auth.domain.group.entity.GroupInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupInviteRepository extends JpaRepository<GroupInvite, String> {
}
