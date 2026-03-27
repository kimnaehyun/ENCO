package io.ssafy.auth.domain.group.service;

import io.ssafy.auth.domain.group.dto.request.GroupAccountCreateRequestDto;
import io.ssafy.auth.domain.group.dto.request.PaymentCreateRequestDto;
import io.ssafy.auth.domain.group.dto.response.ChatRoomCreateResponseDto;
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
            ChatRoomCreateResponseDto chatResult = chatServiceClient.createChatRoom(request.groupName());

            Group group = Group.builder()
                    .name(request.groupName())
                    .ownerUserId(userId)
                    .accountId(null)
                    .build();
            Group savedGroup = groupRepository.save(group);

            String encryptedPassword = passwordEncoder.encode(request.password());

            PaymentCreateRequestDto paymentRequest = new PaymentCreateRequestDto(
                    userId,
                    savedGroup.getId(),
                    encryptedPassword,
                    request.cardProductId()
            );
            CommonResponse<PaymentCreateResponseDto> paymentResult = paymentServiceClient.createAccountAndCard(paymentRequest);

            savedGroup.updateAccountId(paymentResult.result().accountId());
            groupRepository.save(savedGroup);

            User owner = userRepository.findById(userId)
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

            GroupUser groupUser = GroupUser.builder()
                    .group(savedGroup)
                    .user(owner)
                    .role(Role.LEADER)
                    .build();
            groupUserRepository.save(groupUser);

            if (request.groupCategory() != null && !request.groupCategory().isEmpty()) {
                List<Type> foundTypes = typeRepository.findByNameIn(request.groupCategory());
                List<GroupType> groupTypes = foundTypes.stream()
                        .map(type -> GroupType.builder().group(savedGroup).type(type).build())
                        .toList();
                groupTypeRepository.saveAll(groupTypes);
            }

            groupEventProducer.sendGroupCreated(savedGroup.getId(), savedGroup.getName());

            GroupAccountCreateResponseDto response = new GroupAccountCreateResponseDto(
                    savedGroup.getId(),
                    savedGroup.getName(),
                    paymentResult.result().accountId(),
                    paymentResult.result().accountNumber(),
                    paymentResult.result().cardId(),
                    chatResult.chatRoomId()
            );
            return response;

        } catch (Exception e) {
            log.error("==== 모임 통장 생성 에러 ====");
            e.printStackTrace();
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
    public boolean checkGroupMember(Long groupId, Long userId) {
        return groupUserRepository.existsByGroupIdAndUserId(groupId, userId);
    }

}

