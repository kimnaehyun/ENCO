package io.ssafy.chat.chatbot.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.ssafy.chat.chatbot.dto.GmsRequest;
import io.ssafy.chat.chatbot.dto.GmsResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Component
public class GmsLlmClient {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    public GmsLlmClient(
            @Value("${gms.api.url}") String apiUrl,
            @Value("${gms.api.key}") String apiKey,
            ObjectMapper objectMapper       // Spring 빈 주입
    ) {
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * GMS API에 chat completion 요청을 보냅니다.
     */
    public GmsResponse chat(GmsRequest request) {
        try {
            log.info("GMS 요청 본문: {}", new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(request));
            return webClient.post()
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(GmsResponse.class)
                    .block();
        } catch (Exception e) {
            log.error("GMS API 호출 실패: {}", e.getMessage(), e);
            throw new RuntimeException("LLM API 호출에 실패했습니다.", e);
        }
    }
}