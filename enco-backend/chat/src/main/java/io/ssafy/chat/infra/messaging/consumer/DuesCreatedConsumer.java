package io.ssafy.chat.infra.messaging.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.ssafy.chat.common.enums.NotificationType;
import io.ssafy.chat.notification.document.Notification;
import io.ssafy.chat.notification.repository.NotificationRepository;
import io.ssafy.chat.infra.client.AuthServiceClient;
import io.ssafy.chat.notification.service.FcmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DuesCreatedConsumer {

    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;
    private final FcmService fcmService;
    private final AuthServiceClient authServiceClient;

    @KafkaListener(topics = "dues-created", groupId = "chat-service")
    public void consume(String message) {
        try {
            JsonNode node = objectMapper.readTree(message);
            Long groupId = node.get("groupId").asLong();
            String displayName = node.get("displayName").asText("");

            for (JsonNode target : node.get("targets")) {
                Long userId = target.get("userId").asLong();
                Long chargeId = target.get("chargeId").asLong();
                Long chargeTargetId = target.get("chargeTargetId").asLong();
                BigDecimal amount = new BigDecimal(target.get("amount").asText());

                String formattedAmount = NumberFormat.getNumberInstance(Locale.KOREA).format(amount);
                String title = "[" + displayName + "] " + formattedAmount + "원";
                String body = "[" + displayName + "] 건으로 " + formattedAmount + "원 납부 요청이 왔습니다.";

                Notification notification = Notification.builder()
                        .userId(userId)
                        .type(NotificationType.DUES_CREATED)
                        .title(title)
                        .message(body)
                        .data(Map.of(
                                "groupId", groupId,
                                "chargeId", chargeId,
                                "chargeTargetId", chargeTargetId,
                                "amount", amount
                        ))
                        .build();

                Notification saved = notificationRepository.save(notification);

                try {
                    String fcmToken = authServiceClient.getFcmToken(userId).result();
                    Map<String, String> data = Map.of(
                            "notificationId", saved.getId(),
                            "type", "DUES_CREATED",
                            "groupId", String.valueOf(groupId),
                            "chargeId", String.valueOf(chargeId),
                            "chargeTargetId", String.valueOf(chargeTargetId),
                            "amount", amount.toPlainString(),
                            "createdAt", saved.getCreatedAt().toString()
                    );
                    fcmService.sendPushNotification(fcmToken, title, body, data);
                } catch (Exception e) {
                    log.warn("FCM 토큰 조회 실패 - userId: {}", userId);
                }

                log.info("회비 청구 알림 전송 - userId: {}, chargeTargetId: {}", userId, chargeTargetId);
            }
        } catch (Exception e) {
            log.error("dues-created 처리 실패", e);
        }
    }
}
