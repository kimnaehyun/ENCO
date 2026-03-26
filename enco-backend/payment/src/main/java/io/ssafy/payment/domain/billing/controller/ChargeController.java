package io.ssafy.payment.domain.billing.controller;

import io.ssafy.payment.domain.billing.dto.request.CreateChargeRequestDto;
import io.ssafy.payment.domain.billing.dto.request.CreateRegularChargeRequestDto;
import io.ssafy.payment.domain.billing.dto.response.ChargeResponseDto;
import io.ssafy.payment.domain.billing.dto.response.MemberPaymentStatusResponseDto;
import io.ssafy.payment.domain.billing.dto.response.ReminderResponseDto;
import io.ssafy.payment.domain.billing.dto.response.UnpaidChargeResponseDto;
import io.ssafy.payment.domain.billing.service.ChargeService;
import io.ssafy.payment.domain.billing.service.MemberPaymentStatusService;
import io.ssafy.payment.global.common.response.CommonResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
public class ChargeController {

    private final ChargeService chargeService;
    private final MemberPaymentStatusService memberPaymentStatusService;

    /*
    Todo: user 완료되면 createdByUserId 바꾸기, 정산 로직에 이용할 예정
     */
    @PostMapping("/{groupId}/charges")
    public ResponseEntity<CommonResponse<ChargeResponseDto>> createCharge(
            @PathVariable Long groupId,
            @RequestHeader("X-User-Id") Long createdByUserId,
            @Valid @RequestBody CreateChargeRequestDto request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonResponse.success(chargeService.createCharge(groupId, createdByUserId, request)));
    }

    /*
    Todo: user 완료되면 createdByUserId 바꾸기, 이게 정기 회비 로직, 추후 스케쥴링과 배치 처리 예정
     */
    @PostMapping("/{groupId}/charges/regular")
    public ResponseEntity<CommonResponse<ChargeResponseDto>> createRegularCharge(
            @PathVariable Long groupId,
            @RequestHeader("X-User-Id") Long createdByUserId,
            @Valid @RequestBody CreateRegularChargeRequestDto request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonResponse.success(chargeService.createRegularCharge(groupId, createdByUserId, request)));
    }

    @PostMapping("/{groupId}/dues/reminder")
    public ResponseEntity<CommonResponse<ReminderResponseDto>> sendDuesReminder(
            @PathVariable Long groupId
    ) {
        return ResponseEntity.ok(CommonResponse.success(chargeService.sendDuesReminder(groupId)));
    }

    /*
    미납 금액 조회 API
     */
    @GetMapping("/{groupId}/dues/unpaid")
    public ResponseEntity<CommonResponse<UnpaidChargeResponseDto>> getUnpaidCharges(
            @PathVariable Long groupId,
            @RequestHeader("X-User-Id")  Long userId
    ) {
        return ResponseEntity.ok(CommonResponse.success(chargeService.getUnpaidCharges(groupId, userId)));
    }

    @GetMapping("/{groupId}/members/payment-status")
    public ResponseEntity<CommonResponse<MemberPaymentStatusResponseDto>> getMemberPaymentStatus(
            @PathVariable Long groupId
    ) {
        return ResponseEntity.ok(CommonResponse.success(memberPaymentStatusService.getMemberPaymentStatus(groupId)));
    }
}
