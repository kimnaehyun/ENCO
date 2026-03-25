package io.ssafy.chat.notification.repository;

import io.ssafy.chat.notification.document.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    // 사용자의 알림 목록 (최신순)
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    // 사용자의 읽지 않은 알림 목록
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    // 읽지 않은 알림 개수
    long countByUserIdAndIsReadFalse(Long userId);

    // 사용자 + 그룹별 알림 목록 (최신순, 첫 페이지)
    @Query("{ 'userId': ?0, 'data.groupId': ?1 }")
    List<Notification> findByUserIdAndGroupIdOrderByCreatedAtDesc(Long userId, Long groupId, Pageable pageable);

    // 사용자 + 그룹별 알림 목록 (cursor 이후)
    @Query("{ 'userId': ?0, 'data.groupId': ?1, 'createdAt': { $lt: ?2 } }")
    List<Notification> findByUserIdAndGroupIdBeforeCursor(Long userId, Long groupId, LocalDateTime cursor, Pageable pageable);

    // ID 목록으로 알림 조회
    List<Notification> findByIdIn(List<String> ids);
}
