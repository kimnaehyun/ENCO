package io.ssafy.payment.domain.billing.service;

import io.ssafy.payment.domain.billing.dto.response.ReceiptOcrDraftResponseDto;
import io.ssafy.payment.global.common.error.CustomException;
import io.ssafy.payment.global.common.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReceiptOcrService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024L;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "pdf");

    private final ClovaReceiptOcrClient clovaReceiptOcrClient;
    private final ClovaReceiptMapper clovaReceiptMapper;
    public ReceiptOcrDraftResponseDto analyze(MultipartFile file) {
        validateFile(file);
        ClovaReceiptOcrClient.ClovaReceiptOcrRawResult rawResult = clovaReceiptOcrClient.callReceiptOcr(file);
        ReceiptOcrDraftResponseDto mapped = clovaReceiptMapper.map(rawResult);

        if (mapped.merchantName() == null && mapped.totalAmount() == null && mapped.paidAt() == null) {
            throw new CustomException(ErrorCode.OCR_LOW_CONFIDENCE);
        }

        return mapped;
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