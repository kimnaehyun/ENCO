package io.ssafy.payment.domain.billing.service;

import io.ssafy.payment.domain.account.repository.AccountRepository;
import io.ssafy.payment.domain.billing.dto.response.DashboardReportResponseDto;
import io.ssafy.payment.domain.billing.dto.response.GroupDashboardResponseDto;
import io.ssafy.payment.domain.billing.entity.ChargeTargetStatus;
import io.ssafy.payment.domain.billing.repository.ChargeTargetRepository;
import io.ssafy.payment.domain.billing.repository.DuePaymentRepository;
import io.ssafy.payment.infra.client.AuthServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DuePaymentRepository duePaymentRepository;
    private final ChargeTargetRepository chargeTargetRepository;
    private final AccountRepository accountRepository;
    private final AuthServiceClient authServiceClient;

    public GroupDashboardResponseDto getDashboard(Long groupId) {
        AuthServiceClient.GroupInfoResponse groupInfo = authServiceClient.getGroupDashboardInfo(groupId);

        List<ChargeTargetStatus> unpaidStatuses = List.of(ChargeTargetStatus.UNPAID, ChargeTargetStatus.PARTIAL);
        long unpaidCount = chargeTargetRepository.countDistinctUnpaidUsersByGroupId(groupId, unpaidStatuses);
        long paidCount = chargeTargetRepository.countDistinctPaidUsersByGroupId(groupId, unpaidStatuses);

        long total = paidCount + unpaidCount;
        double paidRatio = total == 0 ? 0 : (paidCount * 100.0) / total;
        double unpaidRatio = total == 0 ? 0 : (unpaidCount * 100.0) / total;

        BigDecimal amount = accountRepository.findAmountByGroupId(groupId).orElse(BigDecimal.ZERO);
        BigDecimal balance = amount.add(groupInfo.point());

        return GroupDashboardResponseDto.builder()
                .groupId(groupId)
                .groupName(groupInfo.groupName())
                .paymentStatus(
                        GroupDashboardResponseDto.PaymentStatus.builder()
                                .paidCount((int) paidCount)
                                .unpaidCount((int) unpaidCount)
                                .paidRatio(paidRatio)
                                .unpaidRatio(unpaidRatio)
                                .build()
                )
                .balance(balance)
                .build();
    }

    public DashboardReportResponseDto getDashboardReport(Long groupId) {
        BigDecimal paidAmount = accountRepository.findAmountByGroupId(groupId).orElse(BigDecimal.ZERO);
        BigDecimal pointAmount = authServiceClient.getGroupDashboardInfo(groupId).point();

        return DashboardReportResponseDto.builder()
                .groupId(groupId)
                .balance(paidAmount.add(pointAmount))
                .paidAmount(paidAmount)
                .pointAmount(pointAmount)
                .build();
    }
}