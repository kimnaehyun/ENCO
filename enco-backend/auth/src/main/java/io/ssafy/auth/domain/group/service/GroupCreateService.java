package io.ssafy.auth.domain.group.service;

import io.ssafy.auth.domain.group.dto.request.GroupAccountCreateRequestDto;
import io.ssafy.auth.domain.group.dto.request.PaymentCreateRequestDto;
import io.ssafy.auth.domain.group.dto.response.GroupAccountCreateResponseDto;
import io.ssafy.auth.domain.group.dto.response.PaymentCreateResponseDto;
import io.ssafy.auth.domain.group.dto.response.TypeResponseDto;
import io.ssafy.auth.domain.group.entity.*;
import io.ssafy.auth.domain.group.repository.GroupRepository;
import io.ssafy.auth.domain.group.repository.GroupTypeRepository;
import io.ssafy.auth.domain.group.repository.GroupUserRepository;
import io.ssafy.auth.domain.group.repository.TypeRepository;
import io.ssafy.auth.domain.user.entity.User;
import io.ssafy.auth.domain.user.repository.UserRepository;
import io.ssafy.auth.global.common.error.CustomException;
import io.ssafy.auth.global.common.error.ErrorCode;
import io.ssafy.auth.global.common.response.CommonResponse;
import io.ssafy.auth.infra.client.ChatRoomCreateResponseDto;
import io.ssafy.auth.infra.client.ChatServiceClient;
import io.ssafy.auth.infra.client.PaymentServiceClient;
import io.ssafy.auth.infra.messaging.producer.GroupEventProducer;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class GroupCreateService {
    private final GroupRepository groupRepository;
    private final GroupUserRepository groupUserRepository;
    private final TypeRepository typeRepository;
    private final GroupTypeRepository groupTypeRepository;
    private final UserRepository userRepository;
    private final PaymentServiceClient paymentServiceClient;
    private final ChatServiceClient chatServiceClient;
    private final GroupEventProducer groupEventProducer;
    private final PasswordEncoder passwordEncoder;
    // ...existing code...

    public List<TypeResponseDto> typeList() {
        List<Type> types = typeRepository.findAll();
        return types.stream()
                .map(TypeResponseDto::from)
                .toList();
    }

    public void createType(String type) {
        Type t = new Type();
        t.setName(type);
        typeRepository.save(t);
    }

    @Transactional
    public GroupAccountCreateResponseDto createGroupAccount(Long userId, GroupAccountCreateRequestDto request) {
        try {
            log.info("[GroupCreateService] Starting group creation for userId={}, groupName={}", userId, request.groupName());

            log.info("[GroupCreateService] Creating chat room...");
            ChatRoomCreateResponseDto chatResult = chatServiceClient.createChatRoom(request.groupName());
            log.info("[GroupCreateService] Chat room created: roomId={}", chatResult.chatRoomId());

            // 2. Auth 내부 DB: 모임(Group) 생성 (groupId를 얻기 위해)
            log.info("[GroupCreateService] Creating group...");
            Group group = Group.builder()
                    .name(request.groupName())
                    .ownerUserId(userId)
                    .accountId(null) // Payment 서버에서 받을 예정
                    .build();
            Group savedGroup = groupRepository.save(group);
            log.info("[GroupCreateService] Group created: groupId={}", savedGroup.getId());

            // 3. Payment 서버 호출: 계좌 + 카드 발급
            log.info("[GroupCreateService] Creating payment account and card...");

            String encryptedPassword = passwordEncoder.encode(request.password());

            PaymentCreateRequestDto paymentRequest = new PaymentCreateRequestDto(
                    userId,
                    savedGroup.getId(),
                    encryptedPassword,
                    request.cardProductId()
            );
            CommonResponse<PaymentCreateResponseDto> paymentResult = paymentServiceClient.createAccountAndCard(paymentRequest);

            // 4. Group에 계좌 ID 업데이트
            savedGroup.updateAccountId(paymentResult.result().accountId());
            groupRepository.save(savedGroup);

            // 5. 모임 사용자 생성 (생성자를 LEADER로 설정)
            log.info("[GroupCreateService] Creating group user...");
            User owner = userRepository.findById(userId)
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

            GroupUser groupUser = GroupUser.builder()
                    .group(savedGroup)
                    .user(owner)
                    .role(Role.LEADER)
                    .build();
            groupUserRepository.save(groupUser);
            log.info("[GroupCreateService] Group user created for userId={}", userId);

            // 6. 모임 카테고리 저장
            if (request.groupCategory() != null && !request.groupCategory().isEmpty()) {
                log.info("[GroupCreateService] Saving group categories...");
                List<Type> foundTypes = typeRepository.findByNameIn(request.groupCategory());
                List<GroupType> groupTypes = foundTypes.stream()
                        .map(type -> GroupType.builder().group(savedGroup).type(type).build())
                        .toList();
                groupTypeRepository.saveAll(groupTypes);
            }

            // 7. Kafka 이벤트 발행 (다른 서비스에서 필요한 정보 전파)
            groupEventProducer.sendGroupCreated(savedGroup.getId(), savedGroup.getName());
            log.info("[GroupCreateService] Group created event published: groupId={}", savedGroup.getId());

            // 8. 최종 결과 반환
            GroupAccountCreateResponseDto response = new GroupAccountCreateResponseDto(
                    savedGroup.getId(),
                    savedGroup.getName(),
                    paymentResult.result().accountId(),
                    paymentResult.result().accountNumber(),
                    paymentResult.result().cardId(),
                    chatResult.chatRoomId()
            );
            log.info("[GroupCreateService] Group account creation completed: groupId={}", savedGroup.getId());
            return response;

        } catch (Exception e) {
            log.error("[GroupCreateService] Error creating group account: {}", e.getMessage(), e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
}

