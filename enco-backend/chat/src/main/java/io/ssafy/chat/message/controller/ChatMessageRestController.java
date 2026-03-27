package io.ssafy.chat.message.controller;

import io.ssafy.chat.message.dto.ChatMessageResponse;
import io.ssafy.chat.message.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
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

        log.info("채팅방 메시지 조회 - chatRoomId: {}, page: {}, size: {}", chatRoomId, page, size);
        List<ChatMessageResponse> responses = chatMessageService.getMessages(chatRoomId, page, size);
        log.info("채팅방 메시지 조회 완료 - chatRoomId: {}, 조회된 메시지 수: {}", chatRoomId, responses.size());
        return ResponseEntity.ok(responses);
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

        log.info("이전 메시지 조회 - chatRoomId: {}, beforeMessageId: {}, size: {}", chatRoomId, beforeMessageId, size);
        List<ChatMessageResponse> responses = chatMessageService.getMessagesBefore(chatRoomId, beforeMessageId, size);
        log.info("이전 메시지 조회 완료 - chatRoomId: {}, 조회된 메시지 수: {}", chatRoomId, responses.size());
        return ResponseEntity.ok(responses);
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
