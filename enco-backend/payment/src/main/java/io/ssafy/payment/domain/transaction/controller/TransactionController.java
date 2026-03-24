package io.ssafy.payment.domain.transaction.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.ssafy.payment.domain.billing.dto.request.CreateExpenseRequestDto.PaymentInfoDto;
import io.ssafy.payment.domain.transaction.dto.response.TransactionDetailResponseDto;
import io.ssafy.payment.domain.transaction.dto.response.TransactionListResponseDto;
import io.ssafy.payment.domain.transaction.service.TransactionService;
import io.ssafy.payment.global.common.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final ObjectMapper objectMapper;

    @GetMapping("/api/v1/groups/{groupId}/transactions")
    public ResponseEntity<CommonResponse<TransactionListResponseDto>> getTransactions(
            @PathVariable Long groupId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "LATEST") String sort,
            @RequestParam(defaultValue = "ALL") String type,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "20") int size
    ) {
        TransactionListResponseDto result = transactionService.getTransactions(
                groupId, startDate, endDate, sort, type, cursor, size);
        return ResponseEntity.ok(CommonResponse.success(result));
    }

    @GetMapping("/api/v1/groups/{groupId}/transactions/{transactionId}")
    public ResponseEntity<CommonResponse<TransactionDetailResponseDto>> getTransactionDetail(
            @PathVariable Long groupId,
            @PathVariable Long transactionId
    ) {
        TransactionDetailResponseDto result = transactionService.getTransactionDetail(groupId, transactionId);
        return ResponseEntity.ok(CommonResponse.success(result));
    }

    @PostMapping(value = "/api/v1/groups/{groupId}/transactions/{transactionId}/receipts/contents",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CommonResponse<String>> attachReceiptContent(
            @PathVariable Long groupId,
            @PathVariable Long transactionId,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart("data") String data
    ) throws Exception {
        PaymentInfoDto paymentInfo = objectMapper.readValue(data, PaymentInfoDto.class);
        String receiptImageUrl = transactionService.attachReceiptContent(transactionId, file, paymentInfo);
        return ResponseEntity.ok(CommonResponse.success(receiptImageUrl));
    }
}
