package io.ssafy.payment.domain.account.controller;

import io.ssafy.payment.domain.account.dto.request.CardIssueRequestDto;
import io.ssafy.payment.domain.account.dto.response.CardIssueResponseDto;
import io.ssafy.payment.domain.account.service.AccountService;
import io.ssafy.payment.global.common.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    /**
     * 계좌 카드 추가 발급
     * @param request
     * @return
     */
    @PostMapping("/card-add")
    public ResponseEntity<CommonResponse<CardIssueResponseDto>> issueAdditionalCard(
            @RequestBody CardIssueRequestDto request) {
        return ResponseEntity.ok(CommonResponse.success(accountService.issueAdditionalCard(request)));
    }
}
