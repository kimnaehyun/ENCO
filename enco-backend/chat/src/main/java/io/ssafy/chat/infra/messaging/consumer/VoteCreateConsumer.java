package io.ssafy.chat.infra.messaging.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.ssafy.chat.common.enums.NotificationType;
import io.ssafy.chat.infra.client.AuthServiceClient;
import io.ssafy.chat.notification.dto.VoteNotificationEvent;
import io.ssafy.chat.notification.service.FcmService;
import io.ssafy.chat.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoteCreateConsumer {

    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;
    private final FcmService fcmService;
    private final AuthServiceClient authServiceClient;

    @KafkaListener(topics = "vote-notification", groupId = "chat-service-group")
    public void consumeVoteNotification(String message) {
        try {
            VoteNotificationEvent event = objectMapper.readValue(message, VoteNotificationEvent.class);
            log.info("[Kafka] 알림 수신 - groupId: {}, type: {}", event.getGroupId(), event.getType());

            List<Long> memberIds = authServiceClient.getGroupMembers(event.getGroupId()).result();

            if (memberIds == null || memberIds.isEmpty()) {
                log.warn("[Kafka] 그룹 멤버가 없습니다. 알림 발송 중단 - groupId: {}", event.getGroupId());
                return;
            }

            NotificationType notiType = NotificationType.valueOf(event.getType());

            Map<String, Object> extraData = Map.of(
                    "groupId", event.getGroupId(),
                    "voteId", event.getVoteId()
            );

            Map<String, String> fcmData = Map.of(
                    "groupId", String.valueOf(event.getGroupId()),
                    "voteId", String.valueOf(event.getVoteId()),
                    "type", event.getType()
            );

            for (Long userId : memberIds) {
                try {
                    notificationService.sendNotification(
                            userId,
                            notiType,
                            event.getTitle(),
                            event.getMessage(),
                            extraData
                    );

                    String fcmToken = authServiceClient.getFcmToken(userId).result();

                    if (fcmToken != null && !fcmToken.isBlank()) {
                        fcmService.sendPushNotification(
                                fcmToken,
                                event.getTitle(),
                                event.getMessage(),
                                fcmData
                        );
                    } else {
                        log.debug("[Kafka] FCM 토큰이 없어 푸시 알림 스킵 - userId: {}", userId);
                    }
                } catch (Exception innerEx) {
                    log.error("[Kafka] 단일 유저 알림 발송 실패 - userId: {}", userId, innerEx);
                }
            }

        } catch (Exception e) {
            log.error("[Kafka] 투표/결제 알림 처리 중 시스템 에러 발생", e);
        }
    }
}