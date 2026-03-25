package io.ssafy.chat.chatbot.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

/**
 * GMS 프록시를 통한 OpenAI 호환 임베딩 클라이언트
 *
 * Python 적재 스크립트와 동일한 엔드포인트/모델 사용:
 *   URL:   https://gms.ssafy.io/gmsapi/api.openai.com/v1/embeddings
 *   Model: text-embedding-3-large
 *   Auth:  Authorization: Bearer {key}
 */
@Slf4j
@Component
public class GmsEmbeddingClient {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String model;

    public GmsEmbeddingClient(
            @Value("${gms.embedding.url:https://gms.ssafy.io/gmsapi/api.openai.com/v1/embeddings}") String embeddingUrl,
            @Value("${gms.embedding.key:${gms.api.key}}") String apiKey,
            @Value("${gms.embedding.model:text-embedding-3-large}") String model,
            ObjectMapper objectMapper
    ) {
        this.objectMapper = objectMapper;
        this.model = model;
        this.webClient = WebClient.builder()
                .baseUrl(embeddingUrl)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    /**
     * 텍스트를 임베딩 벡터로 변환 (OpenAI 호환 형식)
     *
     * 요청: { "model": "text-embedding-3-large", "input": ["텍스트"] }
     * 응답: { "data": [{ "embedding": [...], "index": 0 }] }
     */
    public List<Double> embed(String text) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("input", List.of(text));

        try {
            String response = webClient.post()
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.debug("임베딩 응답: {}", response != null ? response.substring(0, Math.min(200, response.length())) : "null");
            return parseEmbedding(response);
        } catch (Exception e) {
            log.error("GMS 임베딩 호출 실패: {}", e.getMessage(), e);
            throw new RuntimeException("임베딩 생성 실패", e);
        }
    }

    private List<Double> parseEmbedding(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);

            // OpenAI 형식: { "data": [{ "embedding": [...], "index": 0 }] }
            if (root.has("data") && root.get("data").isArray() && root.get("data").size() > 0) {
                JsonNode first = root.get("data").get(0);
                if (first.has("embedding")) {
                    JsonNode emb = first.get("embedding");
                    if (emb.isArray()) {
                        return toDoubleList(emb);
                    }
                    if (emb.has("values")) {
                        return toDoubleList(emb.get("values"));
                    }
                }
            }

            // Gemini 형식 폴백: { "embedding": { "values": [...] } }
            if (root.has("embedding")) {
                JsonNode emb = root.get("embedding");
                if (emb.has("values")) {
                    return toDoubleList(emb.get("values"));
                }
                if (emb.isArray()) {
                    return toDoubleList(emb);
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