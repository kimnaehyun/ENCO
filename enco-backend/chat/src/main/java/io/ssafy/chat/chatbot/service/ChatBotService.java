package io.ssafy.chat.chatbot.service;

import io.ssafy.chat.chatbot.client.GmsLlmClient;
import io.ssafy.chat.chatbot.dto.ChatBotRequest;
import io.ssafy.chat.chatbot.dto.ChatBotResponse;
import io.ssafy.chat.chatbot.dto.GmsRequest;
import io.ssafy.chat.chatbot.dto.GmsRequest.Message;
import io.ssafy.chat.chatbot.dto.GmsResponse;
import io.ssafy.chat.common.enums.MessageType;
import io.ssafy.chat.message.dto.ChatMessageRequest;
import io.ssafy.chat.message.dto.ChatMessageResponse;
import io.ssafy.chat.message.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatBotService {

    private static final Long BOT_USER_ID = -1L;

    private final GmsLlmClient gmsLlmClient;
    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${gms.api.model:gpt-4.1-nano}")
    private String model;

    @Value("${gms.api.system-prompt:Answer in Korean}")
    private String systemPrompt;

    @Value("${gms.api.max-tokens:4096}")
    private int maxTokens;

    @Value("${gms.api.temperature:0.3}")
    private double temperature;

    /**
     * 챗봇 질의 — 유저 질문과 봇 응답을 채팅방에 저장하고 브로드캐스트
     */
    public ChatBotResponse ask(ChatBotRequest request) {
        // 1. 유저 질문을 채팅방에 저장 + 브로드캐스트
        ChatMessageRequest userMsg = new ChatMessageRequest(
                MessageType.BOT_QUESTION,
                request.roomId(),
                request.senderId(),
                request.message(),
                null
        );
        ChatMessageResponse savedUserMsg = chatMessageService.saveMessage(userMsg);
        messagingTemplate.convertAndSend(
                "/sub/chat/room/" + request.roomId(), savedUserMsg
        );

        // 2. LLM 호출
        List<Message> messages = List.of(
                new Message("system", systemPrompt),
                new Message("user", request.message())
        );
        GmsRequest gmsRequest = GmsRequest.of(model, messages, maxTokens, temperature);
        GmsResponse gmsResponse = gmsLlmClient.chat(gmsRequest);

        log.info("LLM 응답 수신 - model: {}, tokens: {}", gmsResponse.model(),
                gmsResponse.usage() != null ? gmsResponse.usage().totalTokens() : "N/A");

        // 3. 봇 응답을 채팅방에 저장 + 브로드캐스트
        ChatMessageRequest botMsg = new ChatMessageRequest(
                MessageType.BOT_ANSWER,
                request.roomId(),
                BOT_USER_ID,
                gmsResponse.getContent(),
                null
        );
        ChatMessageResponse savedBotMsg = chatMessageService.saveMessage(botMsg);
        messagingTemplate.convertAndSend(
                "/sub/chat/room/" + request.roomId(), savedBotMsg
        );

        return ChatBotResponse.from(gmsResponse);
    }
}