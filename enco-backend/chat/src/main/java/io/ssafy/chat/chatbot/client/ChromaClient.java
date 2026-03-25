package io.ssafy.chat.chatbot.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.*;

/**
 * Chroma DB 클라이언트 — v1/v2 API 자동 감지
 *
 * Chroma 1.x는 /api/v1 이 deprecated (410 Gone)이므로
 * 먼저 /api/v2를 시도하고, 실패하면 /api/v1으로 폴백합니다.
 */
@Slf4j
@Component
public class ChromaClient {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${chroma.collection-name:lodgings}")
    private String collectionName;

    /** 감지된 API 버전 prefix (null이면 아직 감지 전) */
    private volatile String apiPrefix = null;

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
     * API 버전 자동 감지: /api/v2 → /api/v1 순서로 시도
     */
    private String getApiPrefix() {
        if (apiPrefix != null) return apiPrefix;

        // v2 먼저 시도
        for (String prefix : List.of("/api/v2", "/api/v1")) {
            try {
                String response = webClient.get()
                        .uri(prefix + "/collections/" + collectionName)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();

                if (response != null) {
                    apiPrefix = prefix;
                    log.info("Chroma API 버전 감지: {}", prefix);
                    return apiPrefix;
                }
            } catch (WebClientResponseException e) {
                log.debug("Chroma {} 시도 실패: {} {}", prefix, e.getStatusCode(), e.getMessage());
            } catch (Exception e) {
                log.debug("Chroma {} 시도 실패: {}", prefix, e.getMessage());
            }
        }

        // 둘 다 실패하면 v1으로 폴백
        apiPrefix = "/api/v1";
        log.warn("Chroma API 버전 감지 실패, 기본값 사용: {}", apiPrefix);
        return apiPrefix;
    }

    /**
     * 컬렉션 ID 조회
     */
    private String getCollectionId() {
        String prefix = getApiPrefix();
        try {
            String response = webClient.get()
                    .uri(prefix + "/collections/{name}", collectionName)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode node = objectMapper.readTree(response);
            return node.get("id").asText();
        } catch (Exception e) {
            log.error("Chroma 컬렉션 조회 실패 (prefix={}): {}", prefix, e.getMessage(), e);
            throw new RuntimeException("Chroma 컬렉션 조회 실패", e);
        }
    }

    /**
     * 임베딩 벡터로 Chroma 쿼리 — 상위 n개 숙소 반환
     */
    public List<LodgingResult> query(List<Double> queryEmbedding, int nResults) {
        String collectionId = getCollectionId();
        String prefix = getApiPrefix();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("query_embeddings", List.of(queryEmbedding));
        body.put("n_results", nResults);
        body.put("include", List.of("documents", "metadatas", "distances"));

        try {
            String response = webClient.post()
                    .uri(prefix + "/collections/{id}/query", collectionId)
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