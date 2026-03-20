package io.ssafy.auth.infra.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "chat-service", url = "${service.chat.url}")
public interface ChatServiceClient {

    @PostMapping("/api/v1/internal/chat/room")
    ChatRoomCreateResponseDto createChatRoom(@RequestParam("groupName") String groupName);
}