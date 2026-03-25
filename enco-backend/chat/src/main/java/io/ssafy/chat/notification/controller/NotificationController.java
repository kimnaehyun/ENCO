package io.ssafy.chat.notification.controller;

import io.ssafy.chat.global.common.response.CommonResponse;
import io.ssafy.chat.notification.dto.NotificationPageResponse;
import io.ssafy.chat.notification.dto.NotificationReadRequest;
import io.ssafy.chat.notification.dto.NotificationResponse;
import io.ssafy.chat.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * 알림 목록 조회
     * GET /api/v1/notifications?userId=1
     */
    @GetMapping("/api/v1/notifications")
    public ResponseEntity<List<NotificationResponse>> getNotifications(@RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.getNotifications(userId));
    }

    /**
     * 그룹별 알림 목록 조회
     * GET /api/v1/groups/{groupId}/notifications
     */
    @GetMapping("/api/v1/groups/{groupId}/notifications")
    public ResponseEntity<CommonResponse<NotificationPageResponse>> getNotificationsByGroup(
            @PathVariable Long groupId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(CommonResponse.success(
                notificationService.getNotificationsByGroup(userId, groupId, cursor, size)));
    }

    /**
     * 알림 읽음 처리 (목록)
     * PATCH /api/v1/groups/{groupId}/notifications/read
     */
    @PatchMapping("/api/v1/groups/{groupId}/notifications/read")
    public ResponseEntity<CommonResponse<Void>> markNotificationsAsRead(
            @PathVariable Long groupId,
            @RequestBody NotificationReadRequest request) {
        notificationService.markAsReadBulk(request.notifications());
        return ResponseEntity.ok(CommonResponse.success());
    }

    /**
     * 읽지 않은 알림 목록
     * GET /api/v1/notifications/unread?userId=1
     */
    @GetMapping("/api/v1/notifications/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(@RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    /**
     * 읽지 않은 알림 개수
     * GET /api/v1/notifications/unread/count?userId=1
     */
    @GetMapping("/api/v1/notifications/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestParam Long userId) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(userId)));
    }

    /**
     * 알림 읽음 처리
     * PATCH /api/v1/notifications/{notificationId}/read
     */
    @PatchMapping("/api/v1/notifications/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 전체 알림 읽음 처리
     * PATCH /api/v1/notifications/read-all?userId=1
     */
    @PatchMapping("/api/v1/notifications/read-all")
    public ResponseEntity<Void> markAllAsRead(@RequestParam Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }
}
