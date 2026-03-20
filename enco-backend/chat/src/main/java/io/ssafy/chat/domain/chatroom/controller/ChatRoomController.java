package io.ssafy.chat.domain.chatroom.controller;

import io.ssafy.chat.domain.chatroom.dto.ChatRoomCreateRequest;
import io.ssafy.chat.domain.chatroom.dto.ChatRoomResponse;
import io.ssafy.chat.domain.chatroom.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat-rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    /**
     * 채팅방 생성
     * POST /api/v1/chat-rooms
     */
    @PostMapping
    public ResponseEntity<ChatRoomResponse> createRoom(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody ChatRoomCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chatRoomService.createRoom(userId, request));
    }

    /**
     * 내 채팅방 목록 조회
     * GET /api/v1/chat-rooms
     */
    @GetMapping
    public ResponseEntity<List<ChatRoomResponse>> getMyRooms(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(chatRoomService.getMyRooms(userId));
    }

    /**
     * 채팅방 상세 조회
     * GET /api/v1/chat-rooms/{chatRoomId}
     */
    @GetMapping("/{chatRoomId}")
    public ResponseEntity<ChatRoomResponse> getRoom(@PathVariable String chatRoomId) {
        return ResponseEntity.ok(chatRoomService.getRoom(chatRoomId));
    }

    /**
     * 채팅방 참여
     * POST /api/v1/chat-rooms/{chatRoomId}/join
     */
    @PostMapping("/{chatRoomId}/join")
    public ResponseEntity<ChatRoomResponse> joinRoom(
            @PathVariable String chatRoomId,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(chatRoomService.addParticipant(chatRoomId, userId));
    }

    /**
     * 채팅방 나가기
     * DELETE /api/v1/chat-rooms/{chatRoomId}/leave
     */
    @DeleteMapping("/{chatRoomId}/leave")
    public ResponseEntity<Void> leaveRoom(
            @PathVariable String chatRoomId,
            @RequestHeader("X-User-Id") Long userId) {
        chatRoomService.leaveRoom(chatRoomId, userId);
        return ResponseEntity.noContent().build();
    }
}
