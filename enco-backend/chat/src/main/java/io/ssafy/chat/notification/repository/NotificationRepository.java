package io.ssafy.chat.notification.repository;

import io.ssafy.chat.notification.document.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    // 사용자의 알림 목록 (최신순)
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    // 사용자의 읽지 않은 알림 목록
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    // 읽지 않은 알림 개수
    long countByUserIdAndIsReadFalse(Long userId);
}
