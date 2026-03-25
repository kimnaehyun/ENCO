package io.ssafy.payment.domain.onsite.controller;

import io.ssafy.payment.domain.onsite.dto.request.BarcodePaymentRequestDto;
import io.ssafy.payment.domain.onsite.dto.request.LocationRequestDto;
import io.ssafy.payment.domain.onsite.dto.response.BarcodeResponseDto;
import io.ssafy.payment.domain.onsite.service.OnsitePaymentExecuteService;
import io.ssafy.payment.domain.onsite.service.OnsitePaymentService;
import io.ssafy.payment.global.common.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class OnsitePaymentController {

    private final OnsitePaymentService onsitePaymentService;
    private final OnsitePaymentExecuteService onsitePaymentExecuteService;

    @PostMapping("/{groupId}/location")
    public ResponseEntity<CommonResponse<BarcodeResponseDto>> syncLocation(
            @PathVariable Long groupId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody LocationRequestDto request) {

        BarcodeResponseDto barcode = onsitePaymentService.updateLocationAndCheckBarcode(
                groupId, userId, request.latitude(), request.longitude(), request.isLeader()
        );

        if (barcode == null) {
            return ResponseEntity.ok(CommonResponse.success(null));
        }

        return ResponseEntity.ok(CommonResponse.success(barcode));
    }

    @PostMapping("/pay")
    public ResponseEntity<CommonResponse<Void>> executePayment(
            @RequestBody BarcodePaymentRequestDto request, @RequestHeader("Idempotency-Key") String idempotencyKey) {

        log.info("[현장결제 요청] 바코드={}, 가맹점={}, 금액={}",
                request.barcodeNumber(), request.merchantName(), request.amount());

        onsitePaymentExecuteService.executeBarcodePayment(
                request.barcodeNumber(),
                request.amount(),
                request.merchantName(),
                request.cardId(),
                idempotencyKey
        );

        return ResponseEntity.ok(CommonResponse.success());
    }
}