package io.ssafy.chat.chatbot.service;

import io.ssafy.chat.chatbot.client.GmsLlmClient;
import io.ssafy.chat.chatbot.dto.ChatBotRequest;
import io.ssafy.chat.chatbot.dto.ChatBotResponse;
import io.ssafy.chat.chatbot.dto.GmsRequest;
import io.ssafy.chat.chatbot.dto.GmsRequest.Message;
import io.ssafy.chat.chatbot.dto.GmsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatBotService {

    private final GmsLlmClient gmsLlmClient;

    @Value("${gms.api.model:gpt-4.1-nano}")
    private String model;

    @Value("${gms.api.system-prompt:Answer in Korean}")
    private String systemPrompt;

    @Value("${gms.api.max-tokens:4096}")
    private int maxTokens;

    @Value("${gms.api.temperature:0.3}")
    private double temperature;

    /**
     * 단일 질의 — 대화 이력 없이 시스템 프롬프트 + 사용자 메시지만 전송
     */
    public ChatBotResponse ask(ChatBotRequest request) {
        List<Message> messages = List.of(
                new Message("system", systemPrompt),
                new Message("user", request.message())
        );

        GmsRequest gmsRequest = GmsRequest.of(model, messages, maxTokens, temperature);
        GmsResponse gmsResponse = gmsLlmClient.chat(gmsRequest);

        log.info("LLM 응답 수신 - model: {}, tokens: {}", gmsResponse.model(),
                gmsResponse.usage() != null ? gmsResponse.usage().totalTokens() : "N/A");

        return ChatBotResponse.from(gmsResponse);
    }
}