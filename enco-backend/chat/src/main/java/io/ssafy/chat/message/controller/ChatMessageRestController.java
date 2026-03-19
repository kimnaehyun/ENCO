package io.ssafy.chat.message.controller;

import io.ssafy.chat.message.dto.ChatMessageResponse;
import io.ssafy.chat.message.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat-rooms/{chatRoomId}/messages")
@RequiredArgsConstructor
public class ChatMessageRestController {

    private final ChatMessageService chatMessageService;

    /**
     * 채팅 히스토리 조회
     * GET /api/v1/chat-rooms/{chatRoomId}/messages?page=0&size=50
     */
    @GetMapping
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
            @PathVariable String chatRoomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        return ResponseEntity.ok(chatMessageService.getMessages(chatRoomId, page, size));
    }

    /**
     * 이전 메시지 조회 (무한스크롤)
     * GET /api/v1/chat-rooms/{chatRoomId}/messages/before?beforeMessageId=yyy&size=50
     */
    @GetMapping("/before")
    public ResponseEntity<List<ChatMessageResponse>> getMessagesBefore(
            @PathVariable String chatRoomId,
            @RequestParam String beforeMessageId,
            @RequestParam(defaultValue = "50") int size) {

        return ResponseEntity.ok(chatMessageService.getMessagesBefore(chatRoomId, beforeMessageId, size));
    }

    /**
     * 메시지 삭제
     * DELETE /api/v1/chat-rooms/{chatRoomId}/messages/{messageId}?userId=1
     */
    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable String chatRoomId,
            @PathVariable String messageId,
            @RequestParam Long userId) {

        chatMessageService.deleteMessage(messageId, userId);
        return ResponseEntity.noContent().build();
    }
}
