package io.ssafy.payment.domain.billing.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.ssafy.payment.domain.billing.dto.request.ReceiptContentSubmitRequestDto;
import io.ssafy.payment.domain.billing.dto.response.ReceiptContentSubmitResponseDto;
import io.ssafy.payment.domain.billing.dto.response.ReceiptEvidenceUploadResponseDto;
import io.ssafy.payment.domain.billing.dto.response.ReceiptOcrDraftResponseDto;
import io.ssafy.payment.global.common.error.CustomException;
import io.ssafy.payment.global.common.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReceiptOcrService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024L;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "pdf");

    private final ClovaReceiptOcrClient clovaReceiptOcrClient;
    private final ClovaReceiptMapper clovaReceiptMapper;
    private final ReceiptService receiptService;
    private final ObjectMapper objectMapper;

    public ReceiptOcrDraftResponseDto analyze(MultipartFile file) {
        validateFile(file);
        ClovaReceiptOcrClient.ClovaReceiptOcrRawResult rawResult = clovaReceiptOcrClient.callReceiptOcr(file);
        ReceiptOcrDraftResponseDto mapped = clovaReceiptMapper.map(rawResult);

        if (mapped.merchantName() == null && mapped.totalAmount() == null && mapped.paidAt() == null) {
            throw new CustomException(ErrorCode.OCR_LOW_CONFIDENCE);
        }

        return mapped;
    }

    public ReceiptEvidenceUploadResponseDto uploadEvidence(MultipartFile file, String source, Long groupId) {
        validateFile(file);
        try {
            String url = receiptService.uploadFile(file, "receipt");
            return new ReceiptEvidenceUploadResponseDto(
                    UUID.randomUUID().toString(),
                    url,
                    source,
                    groupId
            );
        } catch (Exception e) {
            log.error("Receipt evidence upload failed", e);
            throw new CustomException(ErrorCode.FILE_UPLOAD_FAIL);
        }
    }

    public ReceiptContentSubmitResponseDto submitContent(ReceiptContentSubmitRequestDto request) {
        if (request == null || request.receipt() == null) {
            throw new CustomException(ErrorCode.BAD_REQUEST);
        }

        return new ReceiptContentSubmitResponseDto(
                request.groupId(),
                request.evidenceId(),
                request.receipt(),
                true
        );
    }

    public String serializeReceiptContent(ReceiptOcrDraftResponseDto receipt) {
        try {
            return objectMapper.writeValueAsString(receipt);
        } catch (JsonProcessingException e) {
            throw new CustomException(ErrorCode.OCR_PARSE_FAILED);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new CustomException(ErrorCode.OCR_INVALID_FILE);
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new CustomException(ErrorCode.OCR_INVALID_FILE);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename == null || !originalFilename.contains(".")
                ? ""
                : originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new CustomException(ErrorCode.OCR_INVALID_FILE);
        }
    }
}