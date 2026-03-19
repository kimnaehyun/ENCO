package io.ssafy.chat.notification.service;

import io.ssafy.chat.common.enums.NotificationType;
import io.ssafy.chat.notification.document.Notification;
import io.ssafy.chat.notification.dto.NotificationResponse;
import io.ssafy.chat.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 알림 생성 + WebSocket으로 실시간 전송
     */
    public void sendNotification(Long userId, NotificationType type,
                                 String title, String message, Map<String, Object> data) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .data(data)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("알림 생성 - userId: {}, type: {}", userId, type);

        // WebSocket으로 실시간 알림 전송
        messagingTemplate.convertAndSend(
                "/sub/notification/" + userId,
                NotificationResponse.from(saved)
        );
    }

    /**
     * 알림 목록 조회
     */
    public List<NotificationResponse> getNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationResponse::from)
                .toList();
    }

    /**
     * 읽지 않은 알림 목록 조회
     */
    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId).stream()
                .map(NotificationResponse::from)
                .toList();
    }

    /**
     * 읽지 않은 알림 개수
     */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * 알림 읽음 처리
     */
    public void markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("알림을 찾을 수 없습니다: " + notificationId));

        notification.markAsRead();
        notificationRepository.save(notification);
    }

    /**
     * 전체 알림 읽음 처리
     */
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);

        unread.forEach(Notification::markAsRead);
        notificationRepository.saveAll(unread);
        log.info("전체 알림 읽음 처리 - userId: {}, count: {}", userId, unread.size());
    }
}
