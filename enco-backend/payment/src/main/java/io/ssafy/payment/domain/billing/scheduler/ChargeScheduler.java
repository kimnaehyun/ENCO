package io.ssafy.payment.domain.billing.scheduler;

import io.ssafy.payment.domain.billing.service.ChargeService;
import io.ssafy.payment.infra.client.AuthServiceClient;
import io.ssafy.payment.infra.client.AuthServiceClient.ActiveDuePolicyResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChargeScheduler {

    private final ChargeService chargeService;
    private final AuthServiceClient authServiceClient;

    @Scheduled(cron = "0 0 9 * * *")
    public void scheduleRegularCharges() {
        List<ActiveDuePolicyResponse> policies = authServiceClient.getTodayActivePolicies();
        log.info("[ChargeScheduler] 오늘 정기회비 생성 대상 정책 수: {}", policies.size());

        for (ActiveDuePolicyResponse policy : policies) {
            try {
                chargeService.createScheduledRegularCharge(policy.groupId(), policy.policyId(), policy.amount());
                log.info("[ChargeScheduler] groupId={} 정기회비 생성 완료", policy.groupId());
            } catch (Exception e) {
                log.error("[ChargeScheduler] groupId={} 정기회비 생성 실패: {}", policy.groupId(), e.getMessage());
            }
        }
    }
}
