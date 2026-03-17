package io.ssafy.auth.domain.group.repository;

import io.ssafy.auth.domain.group.entity.GroupUser;
import io.ssafy.auth.domain.group.entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupUserRepository extends JpaRepository<GroupUser, Long> {

    List<GroupUser> findByGroup_IdAndStatusAndIsDeletedFalse(Long groupId, Status status);

    Optional<GroupUser> findByGroup_IdAndUser_IdAndIsDeletedFalse(Long groupId, Long userId);
}
