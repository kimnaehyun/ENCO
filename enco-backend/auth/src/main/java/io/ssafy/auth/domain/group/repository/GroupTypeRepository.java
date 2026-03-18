package io.ssafy.auth.domain.group.repository;

import io.ssafy.auth.domain.group.entity.GroupType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupTypeRepository extends JpaRepository<GroupType, Long> {

    List<GroupType> findByGroup_Id(Long groupId);

    void deleteByGroup_Id(Long groupId);
}
