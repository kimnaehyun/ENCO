package io.ssafy.payment.domain.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.ssafy.payment.domain.ai.dto.request.ReceiptParseRequestDto;
import io.ssafy.payment.domain.ai.dto.response.ReceiptParseResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gms.url}")
    private String gmsUrl;

    @Value("${gms.key}")
    private String gmsKey;

    @Value("${gms.model}")
    private String gmsModel;

    // -------------------------------------------------------------------------
    // 프롬프트 수정 영역
    // -------------------------------------------------------------------------
    private static final String SYSTEM_PROMPT = """
            당신은 영수증 파싱 전문가입니다.
            영수증 내용을 분석하여 반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.

            {
              "merchantName": "가게명",
              "address": "주소",
              "paidAt": "YYYY-MM-DDTHH:MM:SS",
              "items": [
                {
                  "name": "상품명",
                  "unitPrice": 단가,
                  "quantity": 수량,
                  "amount": 금액,
                  "options": [
                    {
                      "name": "옵션명",
                      "unitPrice": 단가,
                      "quantity": 수량,
                      "amount": 금액
                    }
                  ]
                }
              ],
              "totalAmount": 총금액,
              "businessNumber": "사업자번호"
            }
            """;
    // -------------------------------------------------------------------------

    public ReceiptParseResponseDto parseReceipt(ReceiptParseRequestDto request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(gmsKey);

        Map<String, Object> body = Map.of(
                "model", gmsModel,
                "messages", buildMessages(request.ocrRawText(), request.normalizedText())
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.exchange(gmsUrl, HttpMethod.POST, entity, String.class);

        return parseResponse(response.getBody());
    }

    private List<Map<String, String>> buildMessages(String ocrRawText, String normalizedText) {
        String userContent = "OCR 원본 텍스트:\n" + ocrRawText + "\n\n정규화된 텍스트:\n" + normalizedText;
        return List.of(
                Map.of("role", "developer", "content", SYSTEM_PROMPT),
                Map.of("role", "user", "content", userContent)
        );
    }

    private ReceiptParseResponseDto parseResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String content = root.path("choices").get(0).path("message").path("content").asText();
            return objectMapper.readValue(content, ReceiptParseResponseDto.class);
        } catch (Exception e) {
            throw new RuntimeException("AI 응답 파싱 실패", e);
        }
    }
}
