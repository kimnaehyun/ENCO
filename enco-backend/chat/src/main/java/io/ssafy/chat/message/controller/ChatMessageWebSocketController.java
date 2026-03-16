package io.ssafy.chat.message.controller;

import io.ssafy.chat.chatroom.repository.ChatRoomRepository;
import io.ssafy.chat.common.enums.NotificationType;
import io.ssafy.chat.message.dto.ChatMessageRequest;
import io.ssafy.chat.message.dto.ChatMessageResponse;
import io.ssafy.chat.message.service.ChatMessageService;
import io.ssafy.chat.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

/**
 * WebSocket STOMP 메시지 핸들러
 *
 * 클라이언트 → 서버: /pub/chat/message 로 전송
 * 서버 → 클라이언트: /sub/chat/room/{roomId} 로 브로드캐스트
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatMessageWebSocketController {

    private final ChatMessageService chatMessageService;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatRoomRepository chatRoomRepository;

    /**
     * 채팅 메시지 수신 및 브로드캐스트
     *
     * 클라이언트가 /pub/chat/message 로 메시지를 보내면
     * 1. DB에 저장
     * 2. 같은 채팅방 구독자들에게 브로드캐스트
     * 3. 오프라인 사용자에게 알림 전송
     */
    @MessageMapping("/chat/message")
    public void handleMessage(ChatMessageRequest request) {
        log.info("메시지 수신 - roomId: {}, senderId: {}", request.getRoomId(), request.getSenderId());

        // 1. 메시지 저장
        ChatMessageResponse response = chatMessageService.saveMessage(request);

        // 2. 채팅방 구독자에게 브로드캐스트
        messagingTemplate.convertAndSend(
                "/sub/chat/room/" + request.getRoomId(),
                response
        );

        // 3. 채팅방 참여자에게 알림 전송 (발신자 제외)
        chatRoomRepository.findById(request.getRoomId()).ifPresent(room -> {
            room.getParticipants().stream()
                    .filter(p -> !p.getUserId().equals(request.getSenderId()))
                    .forEach(p -> notificationService.sendNotification(
                            p.getUserId(),
                            NotificationType.CHAT_MESSAGE,
                            "새 메시지",
                            request.getContent(),
                            Map.of(
                                    "roomId", request.getRoomId(),
                                    "messageId", response.getId()
                            )
                    ));
        });
    }

    /**
     * 읽음 처리
     *
     * 클라이언트가 /pub/chat/read 로 보내면
     * 해당 사용자의 lastReadMessageId 업데이트 후 참여자들에게 알림
     */
    @MessageMapping("/chat/read")
    public void handleReadReceipt(ReadReceiptRequest request) {
        log.info("읽음 처리 - roomId: {}, userId: {}, messageId: {}",
                request.getRoomId(), request.getUserId(), request.getMessageId());

        chatRoomRepository.findById(request.getRoomId()).ifPresent(room -> {
            room.getParticipants().stream()
                    .filter(p -> p.getUserId().equals(request.getUserId()))
                    .findFirst()
                    .ifPresent(p -> p.updateLastReadMessageId(request.getMessageId()));
            chatRoomRepository.save(room);

            // 읽음 상태 변경을 채팅방 구독자에게 알림
            messagingTemplate.convertAndSend(
                    "/sub/chat/room/" + request.getRoomId() + "/read",
                    request
            );
        });
    }

    /**
     * 읽음 처리 요청 DTO (inner class)
     */
    @lombok.Getter
    @lombok.NoArgsConstructor
    public static class ReadReceiptRequest {
        private String roomId;
        private Long userId;
        private String messageId;
    }
}
