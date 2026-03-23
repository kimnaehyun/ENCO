package io.ssafy.chat.chatbot.controller;

import io.ssafy.chat.chatbot.dto.ChatBotRequest;
import io.ssafy.chat.chatbot.dto.ChatBotResponse;
import io.ssafy.chat.chatbot.service.ChatBotService;
import io.ssafy.chat.global.common.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/chatbot")
@RequiredArgsConstructor
public class ChatBotController {

    private final ChatBotService chatBotService;

    @PostMapping("/ask")
    public ResponseEntity<CommonResponse<ChatBotResponse>> ask(@RequestBody ChatBotRequest request) {
        ChatBotResponse response = chatBotService.ask(request);
        return ResponseEntity.ok(CommonResponse.success(response));
    }
}