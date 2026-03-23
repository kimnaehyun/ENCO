package io.ssafy.chat.chatbot.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record GmsResponse(
        String id,
        String model,
        List<Choice> choices,
        Usage usage
) {
    public record Choice(
            int index,
            Message message,
            @JsonProperty("finish_reason") String finishReason
    ) {}

    public record Message(
            String role,
            String content
    ) {}

    public record Usage(
            @JsonProperty("prompt_tokens") int promptTokens,
            @JsonProperty("completion_tokens") int completionTokens,
            @JsonProperty("total_tokens") int totalTokens
    ) {}

    /**
     * 첫 번째 응답 메시지 content를 꺼냅니다.
     */
    public String getContent() {
        if (choices == null || choices.isEmpty()) {
            return "";
        }
        return choices.get(0).message().content();
    }
}