package io.ssafy.chat.chatbot.dto;

public record ChatBotRequest(
        String roomId,
        Long senderId,
        String message
) {}