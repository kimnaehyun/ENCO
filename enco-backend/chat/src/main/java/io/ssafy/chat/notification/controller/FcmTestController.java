package io.ssafy.chat.notification.controller;

import io.ssafy.chat.infra.client.AuthServiceClient;
import io.ssafy.chat.notification.service.FcmService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/test/fcm")
@RequiredArgsConstructor
public class FcmTestController {

    private final FcmService fcmService;
    private final AuthServiceClient authServiceClient;

    @PostMapping
    public ResponseEntity<String> sendTestFcm(@RequestHeader("X-User-Id") Long userId) {
        String fcmToken = authServiceClient.getFcmToken(userId).result();
        fcmService.sendPushNotification(
                fcmToken,
                "[테스트] 알림 제목",
                "테스트 알림입니다.",
                Map.of("type", "TEST", "groupId", "1")
        );
        return ResponseEntity.ok("FCM 전송 요청 완료");
    }
}
