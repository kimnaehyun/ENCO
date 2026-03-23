package io.ssafy.payment.domain.billing.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.ssafy.payment.global.common.error.CustomException;
import io.ssafy.payment.global.common.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class ClovaReceiptOcrClient {

    private final RestTemplateBuilder restTemplateBuilder;
    private final ObjectMapper objectMapper;

    @Value("${clova.ocr.invoke-url:}")
    private String invokeUrl;

    @Value("${clova.ocr.secret:}")
    private String secret;

    @Value("${clova.ocr.version:V1}")
    private String version;

    @Value("${clova.ocr.timeout-ms:15000}")
    private long timeoutMs;

    public ClovaReceiptOcrRawResult callReceiptOcr(MultipartFile file) {
        if (invokeUrl == null || invokeUrl.isBlank() || secret == null || secret.isBlank()) {
            throw new CustomException(ErrorCode.OCR_PROVIDER_ERROR);
        }

        String requestId = UUID.randomUUID().toString();
        String extension = extractExtension(file.getOriginalFilename());

        try {
            String base64 = Base64.getEncoder().encodeToString(file.getBytes());

            ClovaOcrRequest request = new ClovaOcrRequest(
                    List.of(new ImageDto(normalizeFormat(extension), "receipt", base64, null)),
                    requestId,
                    System.currentTimeMillis(),
                    version
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-OCR-SECRET", secret);

            RestTemplate restTemplate = restTemplateBuilder
                    .setConnectTimeout(Duration.ofMillis(timeoutMs))
                    .setReadTimeout(Duration.ofMillis(timeoutMs))
                    .build();

            HttpEntity<ClovaOcrRequest> entity = new HttpEntity<>(request, headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    invokeUrl,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            JsonNode rawResponse = objectMapper.readTree(response.getBody());
            return new ClovaReceiptOcrRawResult(requestId, rawResponse);
        } catch (ResourceAccessException e) {
            log.error("CLOVA OCR timeout/access error", e);
            throw new CustomException(ErrorCode.OCR_PROVIDER_TIMEOUT);
        } catch (HttpStatusCodeException e) {
            log.error("CLOVA OCR provider error: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new CustomException(ErrorCode.OCR_PROVIDER_ERROR);
        } catch (IOException e) {
            log.error("Failed to serialize image or parse CLOVA response", e);
            throw new CustomException(ErrorCode.OCR_PARSE_FAILED);
        } catch (Exception e) {
            log.error("Unexpected CLOVA OCR error", e);
            throw new CustomException(ErrorCode.OCR_PROVIDER_ERROR);
        }
    }

    private String extractExtension(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) {
            return "jpg";
        }
        return originalFilename.substring(originalFilename.lastIndexOf('.') + 1);
    }

    private String normalizeFormat(String extension) {
        if (extension == null) {
            return "jpg";
        }
        String normalized = extension.toLowerCase();
        return switch (normalized) {
            case "jpg", "jpeg", "png", "pdf" -> normalized;
            default -> "jpg";
        };
    }

    public record ClovaReceiptOcrRawResult(
            String requestId,
            JsonNode rawResponse
    ) {
    }

    private record ClovaOcrRequest(
            List<ImageDto> images,
            String requestId,
            long timestamp,
            String version
    ) {
    }

    private record ImageDto(
            String format,
            String name,
            String data,
            String url
    ) {
    }
}