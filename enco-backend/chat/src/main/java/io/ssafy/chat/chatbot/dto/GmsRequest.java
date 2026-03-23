package io.ssafy.chat.chatbot.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record GmsRequest(
        String model,
        List<Message> messages,
        @JsonProperty("max_tokens") int maxTokens,
        double temperature
) {
    public record Message(
            String role,
            String content
    ) {}

    public static GmsRequest of(String model, List<Message> messages, int maxTokens, double temperature) {
        return new GmsRequest(model, messages, maxTokens, temperature);
    }
}