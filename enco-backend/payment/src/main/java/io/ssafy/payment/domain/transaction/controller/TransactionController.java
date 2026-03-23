package io.ssafy.payment.domain.transaction.controller;

import io.ssafy.payment.domain.transaction.dto.response.TransactionDetailResponseDto;
import io.ssafy.payment.domain.transaction.dto.response.TransactionListResponseDto;
import io.ssafy.payment.domain.transaction.service.TransactionService;
import io.ssafy.payment.global.common.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping("/{groupId}/transactions")
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

    @GetMapping("/{groupId}/transactions/{transactionId}")
    public ResponseEntity<CommonResponse<TransactionDetailResponseDto>> getTransactionDetail(
            @PathVariable Long groupId,
            @PathVariable Long transactionId
    ) {
        TransactionDetailResponseDto result = transactionService.getTransactionDetail(groupId, transactionId);
        return ResponseEntity.ok(CommonResponse.success(result));
    }
}
