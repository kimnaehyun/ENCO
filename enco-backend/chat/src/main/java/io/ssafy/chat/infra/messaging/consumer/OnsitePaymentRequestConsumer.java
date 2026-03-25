package io.ssafy.chat.infra.messaging.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.ssafy.chat.common.enums.NotificationType;
import io.ssafy.chat.infra.client.AuthServiceClient;
import io.ssafy.chat.notification.service.FcmService;
import io.ssafy.chat.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OnsitePaymentRequestConsumer {

    private final FcmService fcmService;
    private final AuthServiceClient authServiceClient;
    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;

    @KafkaListener(topics = "onsite-payment-request", groupId = "chat-service")
    public void consume(String message) {
        try {
            OnsitePaymentRequestEvent event = objectMapper.readValue(message, OnsitePaymentRequestEvent.class);
            log.info("[현장결제] 결제 요청 이벤트 수신 - groupId: {}, leaderId: {}", event.groupId, event.leaderId);

            Long groupId = event.groupId;
            var memberIds = authServiceClient.getGroupMembers(groupId).result();

            if (memberIds == null || memberIds.isEmpty()) {
                log.warn("[현장결제] 모임 멤버가 없습니다 - groupId: {}", groupId);
                return;
            }

            String title = "현장결제 요청";
            String body = event.leaderName + "님이 현장결제를 요청했습니다.";
            Map<String, String> data = Map.of(
                    "type", "ONSITE_PAYMENT_REQUEST",
                    "groupId", String.valueOf(groupId),
                    "leaderId", String.valueOf(event.leaderId),
                    "timestamp", String.valueOf(event.timestamp)
            );

            // 모든 멤버에게 FCM 알림 전송 (방장 제외)
            for (Long memberId : memberIds) {
                if (!memberId.equals(event.leaderId)) {
                    try {
                        notificationService.sendNotification(
                                memberId,
                                NotificationType.ONSITE_PAYMENT_REQUEST, // Enum에 추가 필요
                                title,
                                body,
                                (Map<String, Object>)(Map) data // Map 타입 캐스팅 주의
                        );

                        String fcmToken = authServiceClient.getFcmToken(memberId).result();
                        if (fcmToken != null && !fcmToken.isBlank()) {
                            fcmService.sendPushNotification(fcmToken, title, body, data);
                            log.info("[현장결제] FCM 전송 - groupId: {}, memberId: {}", groupId, memberId);
                        }
                    } catch (Exception e) {
                        log.warn("[현장결제] FCM 토큰 조회 실패 - memberId: {}", memberId, e);
                    }
                }
            }

            log.info("[현장결제] 현장결제 요청 알림 전송 완료 - groupId: {}", groupId);

        } catch (Exception e) {
            log.error("[현장결제] onsite-payment-request 처리 실패", e);
        }
    }

    static class OnsitePaymentRequestEvent {
        public Long groupId;
        public Long leaderId;
        public String leaderName;
        public Long timestamp;

        public OnsitePaymentRequestEvent() {}

        public OnsitePaymentRequestEvent(Long groupId, Long leaderId, String leaderName, Long timestamp) {
            this.groupId = groupId;
            this.leaderId = leaderId;
            this.leaderName = leaderName;
            this.timestamp = timestamp;
        }
    }
}
