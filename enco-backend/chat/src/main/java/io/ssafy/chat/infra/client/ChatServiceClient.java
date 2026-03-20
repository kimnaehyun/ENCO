package io.ssafy.chat.infra.client;

import io.ssafy.chat.domain.chatroom.dto.response.ChatRoomCreateResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "chat-service", url = "${service.chat.url}")
@RequestMapping("/api/v1/internal/chat")
public interface ChatServiceClient {
    @PostMapping("/room")
    ChatRoomCreateResponseDto createChatRoom(@RequestParam String groupName);
}
