package io.ssafy.chat.chatbot.dto;

public record ChatBotResponse(
        String message,
        String model,
        GmsResponse.Usage usage
) {
    public static ChatBotResponse from(GmsResponse gmsResponse) {
        return new ChatBotResponse(
                gmsResponse.getContent(),
                gmsResponse.model(),
                gmsResponse.usage()
        );
    }
}