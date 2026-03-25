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
import java.util.List;
import java.util.Locale;

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

        // 2. 사용자 질문을 임베딩 → Chroma 검색
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
     */
    private String buildContext(String userQuestion) {
        try {
            List<Double> embedding = gmsEmbeddingClient.embed(userQuestion);
            List<LodgingResult> results = chromaClient.query(embedding, nResults);

            if (results.isEmpty()) {
                return "검색 결과가 없습니다.";
            }

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
        } catch (Exception e) {
            log.error("RAG 검색 실패, 일반 응답으로 대체: {}", e.getMessage(), e);
            return "검색 결과를 가져오지 못했습니다.";
        }
    }
}
