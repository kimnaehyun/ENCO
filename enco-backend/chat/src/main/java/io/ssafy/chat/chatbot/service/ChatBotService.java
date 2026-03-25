package io.ssafy.chat.chatbot.service;

import io.ssafy.chat.chatbot.client.ChromaClient;
import io.ssafy.chat.chatbot.client.ChromaClient.LodgingResult;
import io.ssafy.chat.chatbot.client.GmsEmbeddingClient;
import io.ssafy.chat.chatbot.client.GmsLlmClient;
import io.ssafy.chat.chatbot.dto.ChatBotRequest;
import io.ssafy.chat.chatbot.dto.ChatBotResponse;
import io.ssafy.chat.chatbot.dto.GmsRequest;
import io.ssafy.chat.chatbot.dto.GmsRequest.Message;
import io.ssafy.chat.chatbot.dto.GmsResponse;
import io.ssafy.chat.common.enums.MessageType;
import io.ssafy.chat.message.dto.ChatMessageRequest;
import io.ssafy.chat.message.dto.ChatMessageResponse;
import io.ssafy.chat.message.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatBotService {

    private static final Long BOT_USER_ID = -1L;

    private final GmsLlmClient gmsLlmClient;
    private final GmsEmbeddingClient gmsEmbeddingClient;
    private final ChromaClient chromaClient;
    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${gms.api.model:gpt-4.1-nano}")
    private String model;

    @Value("${gms.api.max-tokens:4096}")
    private int maxTokens;

    @Value("${gms.api.temperature:0.3}")
    private double temperature;

    @Value("${chroma.query.n-results:5}")
    private int nResults;

    private static final String SYSTEM_PROMPT = """
            당신은 숙소 추천 전문 챗봇입니다.
            아래 [검색 결과]에 있는 숙소 정보를 참고하여 사용자의 질문에 한국어로 답변하세요.
            
            답변 규칙:
            - 검색 결과에 있는 숙소만 추천하세요.
            - 각 숙소의 사업장명, 도로명주소, 1박 가격, 평점(rating)을 반드시 포함하세요.
            - 사용자의 요구사항(지역, 가격대, 뷰, 주차 등)에 가장 잘 맞는 숙소를 우선 추천하세요.
            - 친절하고 자연스러운 어투로 답변하세요.
            - 검색 결과에 적절한 숙소가 없으면, 없다고 솔직히 말하세요.
            
            ★ 가격 조건 엄격 적용:
            - 사용자가 가격 조건을 명시한 경우(예: "10만원 이하", "5만원 미만", "20만원 이내"),
              해당 가격 범위를 초과하는 숙소는 절대 추천하지 마세요.
            - 검색 결과에 가격 조건에 맞는 숙소가 하나도 없으면,
              "해당 가격대의 숙소를 찾지 못했습니다"라고 안내하세요.
            - 가격 조건에 맞는 숙소만 골라서 추천하세요.
            """;

    /**
     * 챗봇 질의 — RAG 기반 숙소 추천
     */
    public ChatBotResponse ask(ChatBotRequest request) {
        // 1. 유저 질문을 채팅방에 저장 + 브로드캐스트
        ChatMessageRequest userMsg = new ChatMessageRequest(
                MessageType.BOT_QUESTION,
                request.roomId(),
                request.senderId(),
                request.message(),
                null
        );
        ChatMessageResponse savedUserMsg = chatMessageService.saveMessage(userMsg);
        messagingTemplate.convertAndSend(
                "/sub/chat/room/" + request.roomId(), savedUserMsg
        );

        // 2. 사용자 질문에서 조건 파싱 + Chroma 검색
        String context = buildContext(request.message());

        // 3. 검색 결과를 포함한 프롬프트로 LLM 호출
        String userPromptWithContext = "[검색 결과]\n" + context
                + "\n[사용자 질문]\n" + request.message();

        List<Message> messages = List.of(
                new Message("system", SYSTEM_PROMPT),
                new Message("user", userPromptWithContext)
        );
        GmsRequest gmsRequest = GmsRequest.of(model, messages, maxTokens, temperature);
        GmsResponse gmsResponse = gmsLlmClient.chat(gmsRequest);

        log.info("LLM 응답 수신 - model: {}, tokens: {}", gmsResponse.model(),
                gmsResponse.usage() != null ? gmsResponse.usage().totalTokens() : "N/A");

        // 4. 봇 응답을 채팅방에 저장 + 브로드캐스트
        ChatMessageRequest botMsg = new ChatMessageRequest(
                MessageType.BOT_ANSWER,
                request.roomId(),
                BOT_USER_ID,
                gmsResponse.getContent(),
                null
        );
        ChatMessageResponse savedBotMsg = chatMessageService.saveMessage(botMsg);
        messagingTemplate.convertAndSend(
                "/sub/chat/room/" + request.roomId(), savedBotMsg
        );

        return ChatBotResponse.from(gmsResponse);
    }

    /**
     * 사용자 질문을 임베딩하고 Chroma에서 유사 숙소를 검색하여 컨텍스트 문자열 생성
     * — 메타데이터 필터(가격, 지역, 주차, 뷰)를 자동 파싱하여 적용
     */
    private String buildContext(String userQuestion) {
        try {
            // 질문에서 조건 파싱
            QueryConditions conditions = parseConditions(userQuestion);
            log.info("파싱된 조건: {}", conditions);

            // 임베딩 생성
            List<Double> embedding = gmsEmbeddingClient.embed(userQuestion);

            // Chroma 검색 (더 많이 가져와서 필터링)
            int fetchCount = nResults * 3; // 필터링 후 충분한 결과를 위해 넉넉히
            List<LodgingResult> results = chromaClient.query(embedding, fetchCount);

            if (results.isEmpty()) {
                return "검색 결과가 없습니다.";
            }

            // 메타데이터 기반 후처리 필터링
            List<LodgingResult> filtered = filterResults(results, conditions);
            log.info("검색 결과: {}건 → 필터 후: {}건", results.size(), filtered.size());

            if (filtered.isEmpty()) {
                // 필터에 맞는 결과가 없으면 원본 중 상위 결과라도 전달 (LLM이 판단)
                filtered = results.subList(0, Math.min(nResults, results.size()));
                return formatResults(filtered) + "\n\n※ 참고: 사용자가 요청한 가격/조건에 정확히 맞는 숙소가 검색되지 않았습니다.";
            }

            // 상위 n개만 반환
            filtered = filtered.subList(0, Math.min(nResults, filtered.size()));
            return formatResults(filtered);

        } catch (Exception e) {
            log.error("RAG 검색 실패, 일반 응답으로 대체: {}", e.getMessage(), e);
            return "검색 결과를 가져오지 못했습니다.";
        }
    }

    /**
     * 사용자 질문에서 가격, 지역, 뷰, 주차 조건 파싱
     */
    private QueryConditions parseConditions(String question) {
        QueryConditions c = new QueryConditions();

        // 가격 파싱: "10만원 이하", "5만원 미만", "10만원 이내", "100000원 이하" 등
        Pattern pricePattern = Pattern.compile("(\\d+)만\\s*원?\\s*(이하|미만|이내|까지)");
        Matcher priceMatcher = pricePattern.matcher(question);
        if (priceMatcher.find()) {
            int manwon = Integer.parseInt(priceMatcher.group(1));
            c.maxPrice = manwon * 10000;
            log.info("가격 조건 파싱: {}만원 → maxPrice={}", manwon, c.maxPrice);
        }

        // "~원 이하" 형태 (예: "100000원 이하")
        if (c.maxPrice == null) {
            Pattern rawPricePattern = Pattern.compile("(\\d{4,})\\s*원?\\s*(이하|미만|이내|까지)");
            Matcher rawMatcher = rawPricePattern.matcher(question);
            if (rawMatcher.find()) {
                c.maxPrice = Integer.parseInt(rawMatcher.group(1));
            }
        }

        // "~원 이상" 형태
        Pattern minPricePattern = Pattern.compile("(\\d+)만\\s*원?\\s*(이상|부터)");
        Matcher minMatcher = minPricePattern.matcher(question);
        if (minMatcher.find()) {
            c.minPrice = Integer.parseInt(minMatcher.group(1)) * 10000;
        }

        // 주차 조건
        if (question.contains("주차")) {
            c.parkingRequired = true;
        }

        // 뷰 조건
        if (question.contains("오션뷰") || question.contains("바다")) {
            c.viewType = "ocean";
        } else if (question.contains("시티뷰") || question.contains("도심")) {
            c.viewType = "city";
        } else if (question.contains("마운틴뷰") || question.contains("산")) {
            c.viewType = "mountain";
        }

        return c;
    }

    /**
     * 검색 결과를 조건에 따라 필터링
     */
    private List<LodgingResult> filterResults(List<LodgingResult> results, QueryConditions conditions) {
        return results.stream()
                .filter(r -> {
                    // 가격 상한 필터
                    if (conditions.maxPrice != null && r.price() > conditions.maxPrice) {
                        return false;
                    }
                    // 가격 하한 필터
                    if (conditions.minPrice != null && r.price() < conditions.minPrice) {
                        return false;
                    }
                    return true;
                })
                .sorted(Comparator.comparingDouble(LodgingResult::distance))
                .toList();
    }

    /**
     * 검색 결과를 LLM 프롬프트용 문자열로 포맷팅
     */
    private String formatResults(List<LodgingResult> results) {
        NumberFormat priceFormat = NumberFormat.getNumberInstance(Locale.KOREA);
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < results.size(); i++) {
            LodgingResult r = results.get(i);
            sb.append(String.format(
                    "%d. 사업장명: %s\n   도로명주소: %s\n   가격(1박): %s원\n   평점: %.1f\n\n",
                    i + 1,
                    r.name(),
                    r.address(),
                    priceFormat.format(r.price()),
                    r.rating()
            ));
        }

        return sb.toString();
    }

    /**
     * 파싱된 검색 조건 DTO
     */
    private static class QueryConditions {
        Integer maxPrice;
        Integer minPrice;
        Boolean parkingRequired;
        String viewType;

        @Override
        public String toString() {
            return String.format("QueryConditions{maxPrice=%s, minPrice=%s, parking=%s, view=%s}",
                    maxPrice, minPrice, parkingRequired, viewType);
        }
    }
}