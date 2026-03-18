package io.ssafy.payment.domain.billing.controller;

import io.ssafy.payment.domain.billing.dto.request.CreateChargeRequestDto;
import io.ssafy.payment.domain.billing.dto.request.CreateRegularChargeRequestDto;
import io.ssafy.payment.domain.billing.dto.response.ChargeResponseDto;
import io.ssafy.payment.domain.billing.dto.response.UnpaidChargeResponseDto;
import io.ssafy.payment.domain.billing.service.ChargeService;
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

    /*
    Todo: user 완료되면 createdByUserId 바꾸기, 정산 로직에 이용할 예정
     */
    @PostMapping("/{groupId}/charges/{createdByUserId}")
    public ResponseEntity<ChargeResponseDto> createCharge(
            @PathVariable Long groupId,
            @PathVariable Long createdByUserId,
            @Valid @RequestBody CreateChargeRequestDto request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chargeService.createCharge(groupId, createdByUserId, request));
    }

    /*
    Todo: user 완료되면 createdByUserId 바꾸기, 이게 정기 회비 로직, 추후 스케쥴링과 배치 처리 예정
     */
    @PostMapping("/{groupId}/charges/{createdByUserId}/regular")
    public ResponseEntity<ChargeResponseDto> createRegularCharge(
            @PathVariable Long groupId,
            @PathVariable Long createdByUserId,
            @Valid @RequestBody CreateRegularChargeRequestDto request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chargeService.createRegularCharge(groupId, createdByUserId, request));
    }

    /*
    미납 금액 조회 API
    Todo: user 완료되면 userId 없애기
     */
    @GetMapping("/{groupId}/charges/unpaid/{userId}")
    public ResponseEntity<UnpaidChargeResponseDto> getUnpaidCharges(
            @PathVariable Long groupId,
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(chargeService.getUnpaidCharges(groupId, userId));
    }
}
