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

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DuesReminderConsumer {

    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;
    private final FcmService fcmService;
    private final AuthServiceClient authServiceClient;

    @KafkaListener(topics = "dues-reminder", groupId = "chat-service")
    public void consume(String message) {
        try {
            JsonNode node = objectMapper.readTree(message);
            Long groupId = node.get("groupId").asLong();

            for (JsonNode userIdNode : node.get("unpaidUserIds")) {
                Long userId = userIdNode.asLong();

                Notification notification = Notification.builder()
                        .userId(userId)
                        .type(NotificationType.DUES_REMINDER)
                        .title("미납 회비 알림")
                        .message("미납 금액이 있습니다.")
                        .data(Map.of("groupId", groupId))
                        .build();

                Notification saved = notificationRepository.save(notification);

                try {
                    String fcmToken = authServiceClient.getFcmToken(userId).result();
                    Map<String, String> data = Map.of(
                            "notificationId", saved.getId(),
                            "type", "DUES_REMINDER",
                            "groupId", String.valueOf(groupId),
                            "createdAt", saved.getCreatedAt().toString()
                    );
                    fcmService.sendPushNotification(fcmToken, saved.getTitle(), saved.getMessage(), data);
                } catch (Exception e) {
                    log.warn("FCM 토큰 조회 실패 - userId: {}", userId);
                }

                log.info("회비 미납 알림 전송 - userId: {}", userId);
            }
        } catch (Exception e) {
            log.error("dues-reminder 처리 실패", e);
        }
    }
}
