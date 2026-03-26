package io.ssafy.chat.infra.messaging.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.ssafy.chat.common.enums.NotificationType;
import io.ssafy.chat.notification.document.Notification;
import io.ssafy.chat.notification.dto.SettlementReminderEventDto;
import io.ssafy.chat.notification.repository.NotificationRepository;
import io.ssafy.chat.infra.client.AuthServiceClient;
import io.ssafy.chat.notification.service.FcmService;
import io.ssafy.chat.notification.service.SseEmitterService;
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
public class SettlementReminderConsumer {

    private final SseEmitterService sseEmitterService;
    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;
    private final FcmService fcmService;
    private final AuthServiceClient authServiceClient;

    @KafkaListener(topics = "settlement-reminder", groupId = "chat-service")
    public void consume(String message) {
        try {
            JsonNode node = objectMapper.readTree(message);
            Long groupId = node.get("groupId").asLong();
            Long expenseId = node.get("expenseId").asLong();
            String merchantName = node.get("merchantName").asText("");

            for (JsonNode target : node.get("unpaidTargets")) {
                Long userId = target.get("userId").asLong();
                Long chargeTargetId = target.get("chargeTargetId").asLong();
                BigDecimal amount = new BigDecimal(target.get("amount").asText());

                String formattedAmount = NumberFormat.getNumberInstance(Locale.KOREA).format(amount);
                String title = "[" + merchantName + "] " + formattedAmount + "원";

                Notification notification = Notification.builder()
                        .userId(userId)
                        .type(NotificationType.SETTLEMENT_REMINDER)
                        .title(title)
                        .message("[" + merchantName + "] 건으로 " + formattedAmount + "원 납부 요청이 왔습니다.")
                        .data(Map.of(
                                "groupId", groupId,
                                "expenseId", expenseId,
                                "chargeTargetId", chargeTargetId,
                                "amount", amount
                        ))
                        .build();

                Notification saved = notificationRepository.save(notification);

                SettlementReminderEventDto event = new SettlementReminderEventDto(
                        saved.getId(),
                        "SETTLEMENT_REMINDER",
                        saved.getTitle(),
                        saved.getMessage(),
                        groupId,
                        chargeTargetId,
                        amount,
                        saved.getCreatedAt()
                );

                // SSE (앱 켜져 있을 때)
//                sseEmitterService.sendToUser(userId, event);

                // FCM (앱 꺼져 있을 때)
                try {
                    String fcmToken = authServiceClient.getFcmToken(userId).result();
                    Map<String, String> data = Map.of(
                            "notificationId", saved.getId(),
                            "type", "SETTLEMENT_REMINDER",
                            "groupId", String.valueOf(groupId),
                            "chargeTargetId", String.valueOf(chargeTargetId),
                            "amount", amount.toPlainString(),
                            "createdAt", saved.getCreatedAt().toString()
                    );
                    fcmService.sendPushNotification(fcmToken, saved.getTitle(), saved.getMessage(), data);
                } catch (Exception e) {
                    log.warn("FCM 토큰 조회 실패 - userId: {}", userId);
                }

                log.info("정산 미납 알림 전송 - userId: {}, chargeTargetId: {}", userId, chargeTargetId);
            }
        } catch (Exception e) {
            log.error("settlement-reminder 처리 실패", e);
        }
    }
}
