package io.ssafy.payment.domain.billing.controller;

import io.ssafy.payment.domain.billing.dto.request.CreateFreePaymentRequestDto;
import io.ssafy.payment.domain.billing.dto.request.CreateSelectedPaymentRequestDto;
import io.ssafy.payment.domain.billing.dto.response.DuesPaymentResponseDto;
import io.ssafy.payment.domain.billing.service.DuesPaymentService;
import io.ssafy.payment.global.common.response.CommonResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
public class DuesPaymentController {

    private final DuesPaymentService duesPaymentService;

    @PostMapping("/{groupId}/dues-payments/free")
    public ResponseEntity<CommonResponse<DuesPaymentResponseDto>> payFree(
            @PathVariable Long groupId,
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateFreePaymentRequestDto request
    ) {
        DuesPaymentResponseDto result = duesPaymentService.payFree(groupId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(CommonResponse.success(result));
    }

    @PostMapping("/{groupId}/dues-payments/selected")
    public ResponseEntity<CommonResponse<DuesPaymentResponseDto>> paySelected(
            @PathVariable Long groupId,
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateSelectedPaymentRequestDto request
    ) {
        DuesPaymentResponseDto result = duesPaymentService.paySelected(groupId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(CommonResponse.success(result));
    }
}
