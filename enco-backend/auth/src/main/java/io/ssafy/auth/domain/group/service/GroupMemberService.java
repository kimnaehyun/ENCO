package io.ssafy.auth.domain.group.service;

import io.ssafy.auth.domain.group.dto.request.UpdateMemberRoleRequestDto;
import io.ssafy.auth.domain.group.dto.response.GroupMemberResponseDto;
import io.ssafy.auth.domain.group.entity.GroupUser;
import io.ssafy.auth.domain.group.entity.Role;
import io.ssafy.auth.domain.group.entity.Status;
import io.ssafy.auth.domain.group.repository.GroupRepository;
import io.ssafy.auth.domain.group.repository.GroupUserRepository;
import io.ssafy.auth.global.common.error.CustomException;
import io.ssafy.auth.global.common.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroupMemberService {

    private final GroupRepository groupRepository;
    private final GroupUserRepository groupUserRepository;

    @Transactional(readOnly = true)
    public List<GroupMemberResponseDto> getActiveMembers(Long groupId) {
        groupRepository.findById(groupId)
                .filter(g -> !g.getIsDeleted())
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        return groupUserRepository.findByGroup_IdAndStatusAndIsDeletedFalse(groupId, Status.ACTIVE)
                .stream()
                .map(GroupMemberResponseDto::from)
                .toList();
    }

    @Transactional
    public void updateMemberRole(Long groupId, Long requesterId, Long targetUserId, UpdateMemberRoleRequestDto request) {
        log.info("groupId={}, requesterId={}, targetUserId={}", groupId, requesterId, targetUserId);
        GroupUser requester = groupUserRepository.findByGroup_IdAndUser_IdAndIsDeletedFalse(groupId, requesterId)
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_MEMBER_NOT_FOUND));
        log.info("요청자 확인 완료");

        if (requester.getRole() != Role.LEADER) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        groupUserRepository.findByGroup_IdAndUser_IdAndIsDeletedFalse(groupId, targetUserId)
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_MEMBER_NOT_FOUND))
                .updateRole(request.role());
        log.info("타겟 확인 완료");
    }
}
