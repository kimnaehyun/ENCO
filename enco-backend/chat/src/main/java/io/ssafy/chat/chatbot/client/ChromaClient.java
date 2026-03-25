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
public class ChromaClient {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${chroma.collection-name:lodgings}")
    private String collectionName;

    public ChromaClient(
            @Value("${chroma.url:http://localhost:8000}") String chromaUrl,
            ObjectMapper objectMapper
    ) {
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder()
                .baseUrl(chromaUrl)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * 컬렉션 ID 조회
     */
    private String getCollectionId() {
        try {
            String response = webClient.get()
                    .uri("/api/v1/collections/{name}", collectionName)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode node = objectMapper.readTree(response);
            return node.get("id").asText();
        } catch (Exception e) {
            log.error("Chroma 컬렉션 조회 실패: {}", e.getMessage(), e);
            throw new RuntimeException("Chroma 컬렉션 조회 실패", e);
        }
    }

    /**
     * 임베딩 벡터로 Chroma 쿼리 — 상위 n개 숙소 반환
     */
    public List<LodgingResult> query(List<Double> queryEmbedding, int nResults) {
        String collectionId = getCollectionId();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("query_embeddings", List.of(queryEmbedding));
        body.put("n_results", nResults);
        body.put("include", List.of("documents", "metadatas", "distances"));

        try {
            String response = webClient.post()
                    .uri("/api/v1/collections/{id}/query", collectionId)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseQueryResponse(response);
        } catch (Exception e) {
            log.error("Chroma 쿼리 실패: {}", e.getMessage(), e);
            throw new RuntimeException("Chroma 쿼리 실패", e);
        }
    }

    private List<LodgingResult> parseQueryResponse(String response) {
        List<LodgingResult> results = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(response);

            JsonNode ids = root.get("ids").get(0);
            JsonNode documents = root.get("documents").get(0);
            JsonNode metadatas = root.get("metadatas").get(0);
            JsonNode distances = root.get("distances").get(0);

            for (int i = 0; i < ids.size(); i++) {
                JsonNode meta = metadatas.get(i);
                LodgingResult result = new LodgingResult(
                        ids.get(i).asText(),
                        documents.get(i).asText(),
                        safeText(meta, "name"),
                        safeText(meta, "address"),
                        safeInt(meta, "price"),
                        safeDouble(meta, "rating"),
                        distances.get(i).asDouble()
                );
                results.add(result);
            }
        } catch (Exception e) {
            log.error("Chroma 응답 파싱 실패: {}", e.getMessage(), e);
        }
        return results;
    }

    private String safeText(JsonNode node, String field) {
        if (node == null || !node.has(field) || node.get(field).isNull()) return "";
        return node.get(field).asText();
    }

    private int safeInt(JsonNode node, String field) {
        if (node == null || !node.has(field) || node.get(field).isNull()) return 0;
        return node.get(field).asInt(0);
    }

    private double safeDouble(JsonNode node, String field) {
        if (node == null || !node.has(field) || node.get(field).isNull()) return 0.0;
        return node.get(field).asDouble(0.0);
    }

    /**
     * 검색 결과 DTO
     */
    public record LodgingResult(
            String id,
            String document,
            String name,
            String address,
            int price,
            double rating,
            double distance
    ) {}
}
