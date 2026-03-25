package io.ssafy.chat.chatbot.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@Slf4j
@Component
public class GmsEmbeddingClient {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public GmsEmbeddingClient(
            @Value("${gms.embedding.url:https://gms.ssafy.io/gmsapi/generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent}") String embeddingUrl,
            @Value("${gms.embedding.key:${gms.api.key}}") String apiKey,
            ObjectMapper objectMapper
    ) {
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.webClient = WebClient.builder()
                .baseUrl(embeddingUrl)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * 텍스트를 임베딩 벡터로 변환
     */
    public List<Double> embed(String text) {
        Map<String, Object> content = new LinkedHashMap<>();
        content.put("parts", List.of(Map.of("text", text)));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", "models/text-embedding-004");
        body.put("content", content);

        try {
            String response = webClient.post()
                    .uri(uriBuilder -> uriBuilder.queryParam("key", apiKey).build())
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseEmbedding(response);
        } catch (Exception e) {
            log.error("GMS 임베딩 호출 실패: {}", e.getMessage(), e);
            throw new RuntimeException("임베딩 생성 실패", e);
        }
    }

    private List<Double> parseEmbedding(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);

            // {"embedding": {"values": [...]}}
            if (root.has("embedding")) {
                JsonNode emb = root.get("embedding");
                if (emb.has("values")) {
                    return toDoubleList(emb.get("values"));
                }
                if (emb.isArray()) {
                    return toDoubleList(emb);
                }
            }

            // {"data": [{"embedding": [...]}]}
            if (root.has("data") && root.get("data").isArray() && root.get("data").size() > 0) {
                JsonNode first = root.get("data").get(0);
                if (first.has("embedding")) {
                    JsonNode emb = first.get("embedding");
                    if (emb.has("values")) return toDoubleList(emb.get("values"));
                    if (emb.isArray()) return toDoubleList(emb);
                }
            }

            throw new RuntimeException("임베딩 응답 파싱 실패: " + response.substring(0, Math.min(500, response.length())));
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("임베딩 응답 파싱 실패", e);
        }
    }

    private List<Double> toDoubleList(JsonNode arrayNode) {
        List<Double> result = new ArrayList<>();
        for (JsonNode val : arrayNode) {
            result.add(val.asDouble());
        }
        return result;
    }
}
