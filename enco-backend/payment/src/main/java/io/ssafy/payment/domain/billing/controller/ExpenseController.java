package io.ssafy.payment.domain.billing.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.ssafy.payment.domain.billing.dto.request.CreateExpenseRequestDto;
import io.ssafy.payment.domain.billing.dto.response.ExpenseResponseDto;
import io.ssafy.payment.domain.billing.dto.response.ReminderResponseDto;
import io.ssafy.payment.domain.billing.dto.response.SettlementDefaultersResponseDto;
import io.ssafy.payment.domain.billing.dto.response.SettlementDetailResponseDto;
import io.ssafy.payment.domain.billing.service.ExpenseService;
import io.ssafy.payment.global.common.error.CustomException;
import io.ssafy.payment.global.common.error.ErrorCode;
import io.ssafy.payment.global.common.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final ObjectMapper objectMapper;

    @PostMapping(value = "/{groupId}/settlements", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CommonResponse<ExpenseResponseDto>> createExpense(
            @PathVariable Long groupId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart("data") String data
    ) {
        try {
            CreateExpenseRequestDto request = objectMapper.readValue(data, CreateExpenseRequestDto.class);
            ExpenseResponseDto result = expenseService.createExpense(groupId, userId, file, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(CommonResponse.success(result));
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse expense request data", e);
            throw new CustomException(ErrorCode.BAD_REQUEST);
        }
    }

    @GetMapping("/{groupId}/settlements/{expenseId}")
    public ResponseEntity<CommonResponse<SettlementDetailResponseDto>> getSettlementDetail(
            @PathVariable Long groupId,
            @PathVariable Long expenseId
    ) {
        SettlementDetailResponseDto result = expenseService.getSettlementDetail(groupId, expenseId);
        return ResponseEntity.ok(CommonResponse.success(result));
    }

    @DeleteMapping("/{groupId}/settlements/{expenseId}")
    public ResponseEntity<CommonResponse<Void>> deleteSettlement(
            @PathVariable Long groupId,
            @PathVariable Long expenseId
    ) {
        expenseService.deleteSettlement(groupId, expenseId);
        return ResponseEntity.ok(CommonResponse.success(null));
    }

    @PostMapping("/{groupId}/settlements/{expenseId}/reminder")
    public ResponseEntity<CommonResponse<ReminderResponseDto>> sendReminder(
            @PathVariable Long groupId,
            @PathVariable Long expenseId
    ) {
        ReminderResponseDto result = expenseService.sendReminder(groupId, expenseId);
        return ResponseEntity.ok(CommonResponse.success(result));
    }

    @GetMapping("/{groupId}/settlements/{expenseId}/defaulters")
    public ResponseEntity<CommonResponse<SettlementDefaultersResponseDto>> getSettlementDefaulters(
            @PathVariable Long groupId,
            @PathVariable Long expenseId
    ) {
        SettlementDefaultersResponseDto result = expenseService.getSettlementDefaulters(groupId, expenseId);
        return ResponseEntity.ok(CommonResponse.success(result));
    }
}
