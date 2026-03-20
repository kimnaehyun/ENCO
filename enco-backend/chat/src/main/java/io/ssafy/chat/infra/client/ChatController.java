package io.ssafy.chat.infra.client;

import io.ssafy.chat.domain.chatroom.dto.response.ChatRoomCreateResponseDto;
import io.ssafy.chat.domain.chatroom.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/internal/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @PostMapping("/room")
    public ResponseEntity<ChatRoomCreateResponseDto> createChatRoom(@RequestParam String groupName) {
        ChatRoomCreateResponseDto response = chatService.createRoom(groupName);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
