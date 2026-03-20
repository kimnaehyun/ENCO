package io.ssafy.auth.domain.group.service;

import io.ssafy.auth.domain.group.dto.request.UpdateGroupSettingRequestDto;
import io.ssafy.auth.domain.group.dto.response.GroupSettingResponseDto;
import io.ssafy.auth.domain.group.entity.*;
import io.ssafy.auth.domain.group.repository.*;
import io.ssafy.auth.global.common.error.CustomException;
import io.ssafy.auth.global.common.error.ErrorCode;
import io.ssafy.auth.infra.client.GroupCardResponseDto;
import io.ssafy.auth.infra.client.PaymentServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroupSettingService {

    private final GroupRepository groupRepository;
    private final DuePolicyRepository duePolicyRepository;
    private final GroupTypeRepository groupTypeRepository;
    private final TypeRepository typeRepository;
    private final PaymentServiceClient paymentServiceClient;

    @Transactional(readOnly = true)
    public GroupSettingResponseDto getGroupSetting(Long groupId) {
        var group = groupRepository.findById(groupId)
                .filter(g -> !g.getIsDeleted())
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        DuePolicy policy = duePolicyRepository
                .findByGroupIdAndIsDeletedFalseAndStatus(groupId, DuePolicyStatus.ACTIVE)
                .orElse(null);

        GroupSettingResponseDto.CardDto card = null;
        try {
            GroupCardResponseDto cardResponse = paymentServiceClient.getGroupCard(groupId).result();
            if (cardResponse != null) {
                card = new GroupSettingResponseDto.CardDto(
                        cardResponse.cardId(),
                        cardResponse.cardName(),
                        cardResponse.frontCardImageUrl(),
                        cardResponse.backCardImageUrl(),
                        cardResponse.isBasic()
                );
            }
        } catch (Exception e) {
            log.warn("Failed to fetch card info for groupId={}: {}", groupId, e.getMessage());
        }

        return GroupSettingResponseDto.of(group, policy, card);
    }

    @Transactional
    public void updateGroupSetting(Long groupId, UpdateGroupSettingRequestDto request) {
        Group group = groupRepository.findById(groupId)
                .filter(g -> !g.getIsDeleted())
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        // 모임 기본 정보 수정
        Integer voteCriteria = request.duePolicy() != null ? request.duePolicy().voteCriteria() : null;
        group.updateSettings(request.name(), request.introduction(), request.groundRule(), voteCriteria);

        // 목적(타입) 수정
        if (request.typeIds() != null) {
            groupTypeRepository.deleteByGroup_Id(groupId);
            List<Type> types = typeRepository.findAllById(request.typeIds());
            List<GroupType> newGroupTypes = types.stream()
                    .map(type -> GroupType.builder().group(group).type(type).build())
                    .toList();
            groupTypeRepository.saveAll(newGroupTypes);
        }

        // 회비 정책 수정
        if (request.duePolicy() != null && request.duePolicy().amount() != null) {
            duePolicyRepository.findByGroupIdAndIsDeletedFalseAndStatus(groupId, DuePolicyStatus.ACTIVE)
                    .ifPresent(DuePolicy::pause);

            DuePolicy newPolicy = DuePolicy.builder()
                    .groupId(groupId)
                    .amount(request.duePolicy().amount())
                    .startDate(resolveStartDate(request.duePolicy().dayOfMonth()))
                    .dayOfMonth(request.duePolicy().dayOfMonth())
                    .build();
            duePolicyRepository.save(newPolicy);
        }
    }

    private LocalDate resolveStartDate(Integer dayOfMonth) {
        if (dayOfMonth == null) return LocalDate.now();
        LocalDate today = LocalDate.now();
        LocalDate thisMonth = today.withDayOfMonth(dayOfMonth);
        return today.getDayOfMonth() <= dayOfMonth ? thisMonth : thisMonth.plusMonths(1);
    }
}
