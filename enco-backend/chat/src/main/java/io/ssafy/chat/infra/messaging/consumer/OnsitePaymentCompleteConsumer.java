package io.ssafy.chat.infra.messaging.consumer;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.ssafy.chat.common.enums.NotificationType;
import io.ssafy.chat.infra.client.AuthServiceClient;
import io.ssafy.chat.notification.service.FcmService;
import io.ssafy.chat.notification.service.NotificationService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OnsitePaymentCompleteConsumer {

    private final FcmService fcmService;
    private final AuthServiceClient authServiceClient;
    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;

    @KafkaListener(topics = "onsite-payment-complete", groupId = "chat-service")
    public void consume(String message) {
        try {
            OnsitePaymentCompleteEvent event = objectMapper.readValue(message, OnsitePaymentCompleteEvent.class);
            log.info("[현장결제] 결제 결과 이벤트 수신 - groupId: {}, 가맹점: {}, 성공여부 : {} ", event.getGroupId(), event.getMerchantName(), event.isSuccess());

            Long groupId = event.getGroupId();
            List<Long> memberIds = authServiceClient.getGroupMembers(groupId).result();

            if (memberIds == null || memberIds.isEmpty()) {
                log.warn("[현장결제] 모임 멤버가 없습니다 - groupId: {}", groupId);
                return;
            }

            DecimalFormat df = new DecimalFormat("#,###");
            String formattedAmount = df.format(event.getAmount());

            String title;
            String body;
            String typeStr;

            if (event.isSuccess()) {
                title = "현장결제 완료";
                body = String.format("%s에서 %s원이 결제되었습니다.", event.getMerchantName(), formattedAmount);
                typeStr = "ONSITE_PAYMENT_COMPLETE";
            } else {
                title = "현장결제 실패";
                body = String.format("잔액이 부족하여 %s 현장결제(%s원)에 실패했습니다.", event.getMerchantName(), formattedAmount);
                typeStr = "ONSITE_PAYMENT_FAILED";
            }

            Map<String, Object> extraData = Map.of(
                    "groupId", groupId,
                    "amount", event.getAmount(),
                    "merchantName", event.getMerchantName(),
                    "isSuccess", event.isSuccess()
            );

            Map<String, String> fcmData = Map.of(
                    "type", "ONSITE_PAYMENT_COMPLETE",
                    "groupId", String.valueOf(groupId)
            );

            for (Long memberId : memberIds) {
                try {
                    notificationService.sendNotification(
                            memberId,
                            NotificationType.valueOf(typeStr), // Enum에 ONSITE_PAYMENT_COMPLETE 추가 필요!
                            title,
                            body,
                            extraData
                    );

                    String fcmToken = authServiceClient.getFcmToken(memberId).result();
                    if (fcmToken != null && !fcmToken.isBlank()) {
                        fcmService.sendPushNotification(fcmToken, title, body, fcmData);
                    }
                } catch (Exception e) {
                    log.error("[현장결제] 결제 완료 알림 단일 유저 발송 실패 - memberId: {}", memberId, e);
                }
            }

            log.info("[현장결제] 결제 완료 알림 전체 전송 완료 - groupId: {}", groupId);

        } catch (Exception e) {
            log.error("[현장결제] onsite-payment-complete 처리 실패", e);
        }
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    static class OnsitePaymentCompleteEvent {
        private Long groupId;
        private BigDecimal amount;
        private String merchantName;
        private Long timestamp;

        @JsonProperty("isSuccess")
        private boolean isSuccess;
    }
}