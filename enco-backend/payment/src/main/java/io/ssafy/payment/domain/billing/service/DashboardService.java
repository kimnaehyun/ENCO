package io.ssafy.payment.domain.billing.service;

import io.ssafy.payment.domain.billing.dto.response.GroupDashboardResponseDto;
import io.ssafy.payment.domain.billing.repository.DuePaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DuePaymentRepository duePaymentRepository;
//    private final TransactionRepository transactionRepository;

    public GroupDashboardResponseDto getDashboard(Long groupId) {

        String groupName = "여행모임";

        Object[] result = duePaymentRepository.countPaymentStatus(groupId);

        int paidCount = ((Number) result[0]).intValue();
        int unpaidCount = ((Number) result[1]).intValue();

        int total = paidCount + unpaidCount;

        double paidRatio = total == 0 ? 0 : (paidCount * 100.0) / total;
        double unpaidRatio = total == 0 ? 0 : (unpaidCount * 100.0) / total;

//        Long balance = transactionRepository.findGroupBalance(groupId);
        Long balance = 0L;

        return GroupDashboardResponseDto.builder()
                .groupId(groupId)
                .groupName(groupName)
                .paymentStatus(
                        GroupDashboardResponseDto.PaymentStatus.builder()
                                .paidCount(paidCount)
                                .unpaidCount(unpaidCount)
                                .paidRatio(paidRatio)
                                .unpaidRatio(unpaidRatio)
                                .build()
                )
                .balance(balance)
                .build();
    }
}