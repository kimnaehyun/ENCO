package io.ssafy.auth.domain.group.service;

import io.ssafy.auth.domain.group.dto.request.CreateDuePolicyRequestDto;
import io.ssafy.auth.domain.group.dto.response.DuePolicyResponseDto;
import io.ssafy.auth.domain.group.entity.DuePolicy;
import io.ssafy.auth.domain.group.repository.DuePolicyRepository;
import io.ssafy.auth.domain.group.entity.DuePolicyStatus;
import io.ssafy.auth.domain.group.repository.GroupRepository;
import io.ssafy.auth.global.common.error.CustomException;
import io.ssafy.auth.global.common.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DuePolicyService {

    private final DuePolicyRepository duePolicyRepository;
    private final GroupRepository groupRepository;

    @Transactional
    public DuePolicyResponseDto createPolicy(Long groupId, CreateDuePolicyRequestDto request) {
        if (!groupRepository.existsByIdAndIsDeletedFalse(groupId)) {
            throw new CustomException(ErrorCode.GROUP_NOT_FOUND);
        }

        duePolicyRepository.findByGroupIdAndIsDeletedFalseAndStatus(groupId, DuePolicyStatus.ACTIVE).ifPresent(DuePolicy::pause);

        DuePolicy policy = DuePolicy.builder()
                .groupId(groupId)
                .amount(request.amount())
                .startDate(resolveStartDate(request.dayOfMonth()))
                .dayOfMonth(request.dayOfMonth())
                .build();

        return DuePolicyResponseDto.from(duePolicyRepository.save(policy));
    }

    /**
     * dayOfMonth가 null이면 오늘을 시작일로 설정.
     * dayOfMonth가 있으면 이번 달 해당 일이 아직 지나지 않았으면 이번 달, 지났으면 다음 달로 설정.
     */
    private LocalDate resolveStartDate(Integer dayOfMonth) {
        if (dayOfMonth == null) {
            return LocalDate.now();
        }
        LocalDate today = LocalDate.now();
        LocalDate thisMonth = today.withDayOfMonth(dayOfMonth);
        return today.getDayOfMonth() <= dayOfMonth ? thisMonth : thisMonth.plusMonths(1);
    }
}
