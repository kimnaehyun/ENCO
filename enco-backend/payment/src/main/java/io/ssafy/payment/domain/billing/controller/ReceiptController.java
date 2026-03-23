package io.ssafy.payment.domain.billing.controller;

import io.ssafy.payment.domain.billing.dto.request.ReceiptContentSubmitRequestDto;
import io.ssafy.payment.domain.billing.dto.response.ReceiptContentSubmitResponseDto;
import io.ssafy.payment.domain.billing.dto.response.ReceiptEvidenceUploadResponseDto;
import io.ssafy.payment.domain.billing.dto.response.ReceiptOcrDraftResponseDto;
import io.ssafy.payment.domain.billing.service.ReceiptOcrService;
import io.ssafy.payment.domain.billing.service.ReceiptService;
import io.ssafy.payment.global.common.error.CustomException;
import io.ssafy.payment.global.common.error.ErrorCode;
import io.ssafy.payment.global.common.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptService minioService;
    private final ReceiptOcrService receiptOcrService;

    @PostMapping(value = "/receipts/ocr", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CommonResponse<ReceiptOcrDraftResponseDto>> analyzeReceipt(
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) Long groupId
    ) {
        ReceiptOcrDraftResponseDto result = receiptOcrService.analyze(file);
        return ResponseEntity.ok(new CommonResponse<>("영수증 OCR 분석에 성공했습니다.", result));
    }

    @PostMapping(value = "/receipts/evidence", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CommonResponse<ReceiptEvidenceUploadResponseDto>> uploadReceiptEvidence(
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) Long groupId
    ) {
        ReceiptEvidenceUploadResponseDto result = receiptOcrService.uploadEvidence(file, source, groupId);
        return ResponseEntity.ok(new CommonResponse<>("영수증 증빙 업로드에 성공했습니다.", result));
    }

    @PostMapping(value = "/receipts/content", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CommonResponse<ReceiptContentSubmitResponseDto>> submitReceiptContent(
            @RequestBody ReceiptContentSubmitRequestDto request
    ) {
        ReceiptContentSubmitResponseDto result = receiptOcrService.submitContent(request);
        return ResponseEntity.ok(new CommonResponse<>("영수증 내용 제출에 성공했습니다.", result));
    }

    @PostMapping("/charges/{chargeId}/expenses/receipts")
    public ResponseEntity<CommonResponse<?>> uploadReceiptFile(
            @RequestParam("file") MultipartFile file
    ) {
        try {
            String url = minioService.uploadFile(file, "receipt");
            Map<String, Object> body = new HashMap<>();
            body.put("receiptImageUrl", url);
            body.put("receipt", null);
            return ResponseEntity.ok(CommonResponse.success(body));
        } catch (Exception e) {
            log.error("File upload failed", e);
            throw new CustomException(ErrorCode.FILE_UPLOAD_FAIL);
        }
    }

    @PostMapping("/files/upload")
    public ResponseEntity<CommonResponse<?>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam String bucket
    ) {
        try {
            String url = minioService.uploadFile(file, bucket);
            return ResponseEntity.ok(CommonResponse.success(Map.of(
                    "url", url
            )));
        } catch (Exception e) {
            log.error("File upload failed", e);
            throw new CustomException(ErrorCode.FILE_UPLOAD_FAIL);
        }
    }

    @GetMapping("/files/image/{folder}/{fileName:.+}")
    public ResponseEntity<InputStreamResource> getImage(
            @PathVariable String folder,
            @PathVariable String fileName
    ) {
        try {
            String objectName = folder + "/" + fileName;

            log.info("Fetching image: {}", objectName);

            InputStream stream = minioService.downloadFile(objectName);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(getContentType(fileName)))
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=86400")
                    .body(new InputStreamResource(stream));

        } catch (Exception e) {
            log.error("Image not found: {}/{}", folder, fileName, e);
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/files")
    public ResponseEntity<CommonResponse<?>> deleteFile(@RequestParam String url) {
        try {
            minioService.deleteFileByUrl(url);
            return ResponseEntity.ok(CommonResponse.success(Map.of("success", true)));
        } catch (Exception e) {
            log.error("File delete failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonResponse.success(Map.of("success", false)));
        }
    }

    private String getContentType(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        return switch (extension) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            case "svg" -> "image/svg+xml";
            default -> "application/octet-stream";
        };
    }
}
