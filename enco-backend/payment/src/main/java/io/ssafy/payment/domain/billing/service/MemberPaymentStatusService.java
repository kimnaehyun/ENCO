package io.ssafy.payment.domain.billing.service;

import io.ssafy.payment.domain.billing.dto.response.MemberPaymentStatusResponseDto;
import io.ssafy.payment.domain.billing.dto.response.MemberPaymentStatusResponseDto.MemberStatusDto;
import io.ssafy.payment.domain.billing.entity.ChargeTarget;
import io.ssafy.payment.domain.billing.entity.ChargeTargetStatus;
import io.ssafy.payment.domain.billing.repository.ChargeTargetRepository;
import io.ssafy.payment.infra.client.AuthServiceClient;
import io.ssafy.payment.infra.client.AuthServiceClient.UserDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberPaymentStatusService {

    private final ChargeTargetRepository chargeTargetRepository;
    private final AuthServiceClient authServiceClient;

    @Transactional(readOnly = true)
    public MemberPaymentStatusResponseDto getMemberPaymentStatus(Long groupId) {
        // 1. 그룹의 모든 모임원 userId 조회 (Auth 서비스)
        List<Long> memberIds = authServiceClient.getActiveMemberIds(groupId);

        if (memberIds.isEmpty()) {
            return new MemberPaymentStatusResponseDto(groupId, 0, 0, 0, List.of(), List.of());
        }

        // 2. 그룹의 모든 ChargeTarget 조회
        List<ChargeTarget> allTargets = chargeTargetRepository.findByCharge_GroupIdAndIsDeletedFalse(groupId);

        // userId별 미납 잔액 합산
        Map<Long, BigDecimal> unpaidAmountByUser = allTargets.stream()
                .filter(t -> t.getStatus() == ChargeTargetStatus.UNPAID || t.getStatus() == ChargeTargetStatus.PARTIAL)
                .collect(Collectors.groupingBy(
                        ChargeTarget::getUserId,
                        Collectors.reducing(BigDecimal.ZERO, ChargeTarget::getRemainingAmount, BigDecimal::add)
                ));

        // 3. 유저 상세 정보 배치 조회 (Auth 서비스)
        Map<Long, UserDetailResponse> userDetailMap = authServiceClient.getMemberDetails(memberIds)
                .stream()
                .collect(Collectors.toMap(UserDetailResponse::userId, u -> u));

        // 4. 납부/미납 분류
        List<MemberStatusDto> unpaidMembers = new ArrayList<>();
        List<MemberStatusDto> paidMembers = new ArrayList<>();

        for (Long userId : memberIds) {
            UserDetailResponse userDetail = userDetailMap.get(userId);
            String name = userDetail != null ? userDetail.name() : "알 수 없음";
            Integer profileImage = userDetail != null ? userDetail.profileImage() : null;

            if (unpaidAmountByUser.containsKey(userId)) {
                unpaidMembers.add(new MemberStatusDto(
                        userId, name, profileImage,
                        "UNPAID",
                        unpaidAmountByUser.get(userId)
                ));
            } else {
                paidMembers.add(new MemberStatusDto(
                        userId, name, profileImage,
                        "PAID",
                        BigDecimal.ZERO
                ));
            }
        }

        return new MemberPaymentStatusResponseDto(
                groupId,
                memberIds.size(),
                unpaidMembers.size(),
                paidMembers.size(),
                unpaidMembers,
                paidMembers
        );
    }
}
