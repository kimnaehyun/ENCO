package io.ssafy.payment.domain.account.controller;

import io.ssafy.payment.domain.account.dto.request.PaymentCreateRequestDto;
import io.ssafy.payment.domain.account.dto.response.GroupAccountCardResponseDto;
import io.ssafy.payment.domain.account.dto.response.PaymentCreateResponseDto;
import io.ssafy.payment.domain.account.service.AccountService;
import io.ssafy.payment.domain.card.dto.response.GroupCardResponseDto;
import io.ssafy.payment.domain.card.service.CardService;
import io.ssafy.payment.global.common.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/internal")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final CardService cardService;

    @PostMapping("/payments/graoup-account")
    public ResponseEntity<CommonResponse<PaymentCreateResponseDto>> createAccountAndCard(@RequestBody PaymentCreateRequestDto request) {
        PaymentCreateResponseDto response = accountService.createAccountAndCard(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(CommonResponse.success(response));
    }

    @GetMapping("/payments/groups/{groupId}/card")
    public ResponseEntity<CommonResponse<GroupCardResponseDto>> getGroupCard(@PathVariable Long groupId) {
        return ResponseEntity.ok(CommonResponse.success(cardService.getGroupCard(groupId)));
    }

    @GetMapping("/accounts/by-ids")
    public ResponseEntity<CommonResponse<List<GroupAccountCardResponseDto>>> getAccountsByIds(
            @RequestParam List<Long> accountIds) {
        return ResponseEntity.ok(CommonResponse.success(accountService.getAccountsByIds(accountIds)));
    }
}