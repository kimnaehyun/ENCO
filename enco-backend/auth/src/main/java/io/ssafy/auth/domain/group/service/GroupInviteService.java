package io.ssafy.auth.domain.group.service;

import io.ssafy.auth.domain.group.dto.response.InviteLinkResponseDto;
import io.ssafy.auth.domain.group.entity.Group;
import io.ssafy.auth.domain.group.entity.GroupInvite;
import io.ssafy.auth.domain.group.entity.GroupUser;
import io.ssafy.auth.domain.group.entity.Role;
import io.ssafy.auth.domain.group.entity.Status;
import io.ssafy.auth.domain.group.repository.GroupInviteRepository;
import io.ssafy.auth.domain.group.repository.GroupRepository;
import io.ssafy.auth.domain.group.repository.GroupUserRepository;
import io.ssafy.auth.domain.user.entity.User;
import io.ssafy.auth.domain.user.repository.UserRepository;
import io.ssafy.auth.global.common.error.CustomException;
import io.ssafy.auth.global.common.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GroupInviteService {

    private static final Duration INVITE_TTL = Duration.ofDays(7);
    private static final String REDIS_KEY_PREFIX = "invite:";

    private final GroupRepository groupRepository;
    private final GroupUserRepository groupUserRepository;
    private final GroupInviteRepository groupInviteRepository;
    private final UserRepository userRepository;
    private final StringRedisTemplate redisTemplate;

    @Transactional
    public InviteLinkResponseDto createInviteLink(Long groupId, Long requesterId) {
        groupRepository.findById(groupId)
                .filter(g -> !g.getIsDeleted())
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        groupUserRepository.findByGroup_IdAndUser_IdAndStatusAndIsDeletedFalse(groupId, requesterId, Status.ACTIVE)
                .filter(gu -> gu.getRole() == Role.LEADER)
                .orElseThrow(() -> new CustomException(ErrorCode.FORBIDDEN));

        String token = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plus(INVITE_TTL);

        GroupInvite invite = GroupInvite.builder()
                .token(token)
                .groupId(groupId)
                .createdByUserId(requesterId)
                .expiresAt(expiresAt)
                .build();

        groupInviteRepository.save(invite);
        redisTemplate.opsForValue().set(REDIS_KEY_PREFIX + token, String.valueOf(groupId), INVITE_TTL);

        return InviteLinkResponseDto.from(invite);
    }

    @Transactional
    public Long joinGroup(String token, Long userId) {
        String groupIdStr = redisTemplate.opsForValue().get(REDIS_KEY_PREFIX + token);
        if (groupIdStr == null) {
            throw new CustomException(ErrorCode.INVITE_NOT_FOUND);
        }

        Long groupId = Long.parseLong(groupIdStr);

        Group group = groupRepository.findById(groupId)
                .filter(g -> !g.getIsDeleted())
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_MEMBER_NOT_FOUND));

        boolean alreadyMember = groupUserRepository
                .findByGroup_IdAndUser_IdAndStatusAndIsDeletedFalse(groupId, userId, Status.ACTIVE)
                .isPresent();
        if (alreadyMember) {
            throw new CustomException(ErrorCode.ALREADY_GROUP_MEMBER);
        }

        groupUserRepository.save(GroupUser.builder()
                .group(group)
                .user(user)
                .role(Role.USER)
                .status(Status.ACTIVE)
                .isDeleted(false)
                .build());

        return groupId;
    }
}
