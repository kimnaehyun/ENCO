package io.ssafy.payment.domain.billing.service;

import io.ssafy.payment.domain.billing.dto.request.CreateChargeRequestDto;
import io.ssafy.payment.domain.billing.dto.request.CreateRegularChargeRequestDto;
import io.ssafy.payment.domain.billing.dto.response.ChargeResponseDto;
import io.ssafy.payment.domain.billing.dto.response.UnpaidChargeResponseDto;
import io.ssafy.payment.domain.billing.entity.Charge;
import io.ssafy.payment.domain.billing.entity.ChargeTarget;
import io.ssafy.payment.domain.billing.entity.ChargeTargetStatus;
import io.ssafy.payment.domain.billing.entity.ChargeType;
import io.ssafy.payment.domain.billing.repository.ChargeRepository;
import io.ssafy.payment.domain.billing.repository.ChargeTargetRepository;
import io.ssafy.payment.infra.client.AuthServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChargeService {

    private final ChargeRepository chargeRepository;
    private final ChargeTargetRepository chargeTargetRepository;
    private final AuthServiceClient authServiceClient;

    @Transactional
    public ChargeResponseDto createCharge(Long groupId, Long createdByUserId, CreateChargeRequestDto request) {
        String displayName = LocalDate.now().getYear() + "년 "
                + LocalDate.now().getMonthValue() + "월 정기회비";

        BigDecimal totalAmount = request.amount().multiply(BigDecimal.valueOf(request.targetUserIds().size()));

        Charge charge = Charge.builder()
                .groupId(groupId)
                .policyId(request.policyId())
                .createdByUserId(createdByUserId)
                .displayName(displayName)
                .totalAmount(totalAmount)
                .chargeType(ChargeType.REGULAR_DUE)
                .build();

        chargeRepository.save(charge);

        List<ChargeTarget> targets = request.targetUserIds().stream()
                .map(userId -> ChargeTarget.builder()
                        .charge(charge)
                        .userId(userId)
                        .amount(request.amount())
                        .build())
                .toList();

        chargeTargetRepository.saveAll(targets);

        return ChargeResponseDto.of(charge, targets);
    }

    @Transactional
    public ChargeResponseDto createRegularCharge(Long groupId, Long createdByUserId, CreateRegularChargeRequestDto request) {
        List<Long> memberIds = authServiceClient.getActiveMemberIds(groupId);

        String displayName = LocalDate.now().getYear() + "년 "
                + LocalDate.now().getMonthValue() + "월 정기회비";

        BigDecimal totalAmount = request.amount().multiply(BigDecimal.valueOf(memberIds.size()));

        Charge charge = Charge.builder()
                .groupId(groupId)
                .policyId(request.policyId())
                .createdByUserId(createdByUserId)
                .displayName(displayName)
                .totalAmount(totalAmount)
                .chargeType(ChargeType.REGULAR_DUE)
                .build();

        chargeRepository.save(charge);

        List<ChargeTarget> targets = memberIds.stream()
                .map(userId -> ChargeTarget.builder()
                        .charge(charge)
                        .userId(userId)
                        .amount(request.amount())
                        .build())
                .toList();

        chargeTargetRepository.saveAll(targets);

        return ChargeResponseDto.of(charge, targets);
    }

    @Transactional
    public void createScheduledRegularCharge(Long groupId, Long policyId, BigDecimal amount) {
        List<Long> memberIds = authServiceClient.getActiveMemberIds(groupId);
        if (memberIds.isEmpty()) return;

        String displayName = LocalDate.now().getYear() + "년 "
                + LocalDate.now().getMonthValue() + "월 정기회비";

        BigDecimal totalAmount = amount.multiply(BigDecimal.valueOf(memberIds.size()));

        Charge charge = Charge.builder()
                .groupId(groupId)
                .policyId(policyId)
                .displayName(displayName)
                .totalAmount(totalAmount)
                .chargeType(ChargeType.REGULAR_DUE)
                .build();

        chargeRepository.save(charge);

        List<ChargeTarget> targets = memberIds.stream()
                .map(userId -> ChargeTarget.builder()
                        .charge(charge)
                        .userId(userId)
                        .amount(amount)
                        .build())
                .toList();

        chargeTargetRepository.saveAll(targets);
    }

    @Transactional(readOnly = true)
    public UnpaidChargeResponseDto getUnpaidCharges(Long groupId, Long userId) {
        List<ChargeTarget> targets = chargeTargetRepository
                .findByUserIdAndCharge_GroupIdAndStatusInAndIsDeletedFalse(
                        userId, groupId, List.of(ChargeTargetStatus.UNPAID, ChargeTargetStatus.PARTIAL));

        return UnpaidChargeResponseDto.of(groupId, userId, targets);
    }
}
