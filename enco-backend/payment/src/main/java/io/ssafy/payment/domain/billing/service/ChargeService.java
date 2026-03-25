package io.ssafy.payment.domain.billing.service;

import io.ssafy.payment.domain.billing.dto.request.CreateChargeRequestDto;
import io.ssafy.payment.domain.billing.dto.request.CreateRegularChargeRequestDto;
import io.ssafy.payment.domain.billing.dto.response.ChargeResponseDto;
import io.ssafy.payment.domain.billing.dto.response.UnpaidChargeResponseDto;
import io.ssafy.payment.domain.billing.entity.Charge;
import io.ssafy.payment.domain.billing.entity.ChargeTarget;
import io.ssafy.payment.domain.billing.entity.ChargeTargetStatus;
import io.ssafy.payment.domain.billing.entity.ChargeType;
import io.ssafy.payment.domain.billing.entity.DuePayment;
import io.ssafy.payment.domain.billing.entity.DuesPaymentStatus;
import io.ssafy.payment.domain.billing.entity.UserPrepayment;
import io.ssafy.payment.domain.billing.repository.ChargeRepository;
import io.ssafy.payment.domain.billing.repository.ChargeTargetRepository;
import io.ssafy.payment.domain.billing.repository.DuePaymentRepository;
import io.ssafy.payment.domain.billing.repository.UserPrepaymentRepository;
import io.ssafy.payment.domain.billing.dto.response.ReminderResponseDto;
import io.ssafy.payment.infra.client.AuthServiceClient;
import io.ssafy.payment.infra.messaging.producer.KafkaProducerService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChargeService {

    private final ChargeRepository chargeRepository;
    private final ChargeTargetRepository chargeTargetRepository;
    private final AuthServiceClient authServiceClient;
    private final UserPrepaymentRepository userPrepaymentRepository;
    private final DuePaymentRepository duePaymentRepository;
    private final KafkaProducerService kafkaProducerService;
    private final ObjectMapper objectMapper;

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

        // prepayment 잔액이 있는 유저는 자동 납부 처리
        for (ChargeTarget target : targets) {
            userPrepaymentRepository.findByUserIdAndGroupId(target.getUserId(), groupId)
                    .filter(p -> p.getBalance().compareTo(BigDecimal.ZERO) > 0)
                    .ifPresent(prepayment -> {
                        BigDecimal payAmount = prepayment.getBalance().compareTo(target.getRemainingAmount()) >= 0
                                ? target.getRemainingAmount()
                                : prepayment.getBalance();

                        DuePayment payment = DuePayment.builder()
                                .payerUserId(target.getUserId())
                                .groupId(groupId)
                                .chargeTarget(target)
                                .amount(payAmount)
                                .idempotencyKey(UUID.randomUUID().toString())
                                .status(DuesPaymentStatus.SUCCESS)
                                .build();
                        duePaymentRepository.save(payment);

                        target.pay(payAmount);
                        prepayment.deduct(payAmount);
                        userPrepaymentRepository.save(prepayment);
                    });
        }

        sendDuesCreatedNotification(groupId, targets);

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

        // prepayment 잔액이 있는 유저는 자동 납부 처리
        for (ChargeTarget target : targets) {
            userPrepaymentRepository.findByUserIdAndGroupId(target.getUserId(), groupId)
                    .filter(p -> p.getBalance().compareTo(BigDecimal.ZERO) > 0)
                    .ifPresent(prepayment -> {
                        BigDecimal payAmount = prepayment.getBalance().compareTo(target.getRemainingAmount()) >= 0
                                ? target.getRemainingAmount()
                                : prepayment.getBalance();

                        DuePayment payment = DuePayment.builder()
                                .payerUserId(target.getUserId())
                                .groupId(groupId)
                                .chargeTarget(target)
                                .amount(payAmount)
                                .idempotencyKey(UUID.randomUUID().toString())
                                .status(DuesPaymentStatus.SUCCESS)
                                .build();
                        duePaymentRepository.save(payment);

                        target.pay(payAmount);
                        prepayment.deduct(payAmount);
                        userPrepaymentRepository.save(prepayment);
                    });
        }

        sendDuesCreatedNotification(groupId, targets);
    }

    private void sendDuesCreatedNotification(Long groupId, List<ChargeTarget> targets) {
        try {
            List<Map<String, Object>> targetInfos = targets.stream()
                    .map(t -> Map.of(
                            "userId", (Object) t.getUserId(),
                            "chargeId", (Object) t.getCharge().getId(),
                            "chargeTargetId", (Object) t.getId(),
                            "amount", (Object) t.getAmount()
                    ))
                    .toList();

            String displayName = targets.get(0).getCharge().getDisplayName();

            String payload = objectMapper.writeValueAsString(Map.of(
                    "groupId", groupId,
                    "displayName", displayName != null ? displayName : "",
                    "targets", targetInfos
            ));
            kafkaProducerService.send("dues-created", payload);
        } catch (Exception e) {
            log.error("dues-created Kafka 전송 실패 - groupId: {}", groupId, e);
        }
    }

    @Transactional(readOnly = true)
    public ReminderResponseDto sendDuesReminder(Long groupId, Long chargeId) {
        Charge charge = chargeRepository.findById(chargeId)
                .orElseThrow(() -> new RuntimeException("청구를 찾을 수 없습니다."));

        if (!charge.getGroupId().equals(groupId)) {
            throw new RuntimeException("해당 그룹의 청구가 아닙니다.");
        }

        List<Map<String, Object>> unpaidTargets = chargeTargetRepository
                .findByCharge_IdAndIsDeletedFalse(chargeId).stream()
                .filter(t -> t.getStatus() != ChargeTargetStatus.PAID)
                .map(t -> Map.of(
                        "userId", (Object) t.getUserId(),
                        "chargeTargetId", (Object) t.getId(),
                        "amount", (Object) t.getRemainingAmount()
                ))
                .toList();

        int requestedCount = unpaidTargets.size();
        LocalDateTime sentAt = LocalDateTime.now();

        if (requestedCount == 0) {
            return new ReminderResponseDto(chargeId, 0, 0, 0, sentAt);
        }

        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                    "type", "DUES_REMINDER",
                    "groupId", groupId,
                    "chargeId", chargeId,
                    "merchantName", charge.getDisplayName() != null ? charge.getDisplayName() : "",
                    "unpaidTargets", unpaidTargets
            ));
            kafkaProducerService.send("settlement-reminder", payload);
            return new ReminderResponseDto(chargeId, requestedCount, requestedCount, 0, sentAt);
        } catch (Exception e) {
            log.error("dues-reminder Kafka 전송 실패", e);
            return new ReminderResponseDto(chargeId, requestedCount, 0, requestedCount, sentAt);
        }
    }

    @Transactional(readOnly = true)
    public ReminderResponseDto sendDuesReminder(Long groupId) {
        List<Long> unpaidUserIds = chargeTargetRepository
                .findByCharge_GroupIdAndStatusInAndIsDeletedFalse(groupId, List.of(ChargeTargetStatus.UNPAID, ChargeTargetStatus.PARTIAL))
                .stream()
                .map(ChargeTarget::getUserId)
                .distinct()
                .toList();

        int requestedCount = unpaidUserIds.size();
        LocalDateTime sentAt = LocalDateTime.now();

        if (requestedCount == 0) {
            return new ReminderResponseDto(null, 0, 0, 0, sentAt);
        }

        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                    "type", "DUES_REMINDER",
                    "groupId", groupId,
                    "unpaidUserIds", unpaidUserIds
            ));
            kafkaProducerService.send("dues-reminder", payload);
            return new ReminderResponseDto(null, requestedCount, requestedCount, 0, sentAt);
        } catch (Exception e) {
            log.error("dues-reminder Kafka 전송 실패", e);
            return new ReminderResponseDto(null, requestedCount, 0, requestedCount, sentAt);
        }
    }

    @Transactional(readOnly = true)
    public UnpaidChargeResponseDto getUnpaidCharges(Long groupId, Long userId) {
        List<ChargeTarget> targets = chargeTargetRepository
                .findByUserIdAndCharge_GroupIdAndStatusInAndIsDeletedFalse(
                        userId, groupId, List.of(ChargeTargetStatus.UNPAID, ChargeTargetStatus.PARTIAL));

        return UnpaidChargeResponseDto.of(groupId, userId, targets);
    }
}
