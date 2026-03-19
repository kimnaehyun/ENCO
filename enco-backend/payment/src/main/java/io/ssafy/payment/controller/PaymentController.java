package io.ssafy.payment.controller;

import io.ssafy.payment.domain.account.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/internal/payments") // 내부 통신용 API는 보통 internal을 붙입니다.
@RequiredArgsConstructor
public class PaymentController {

    private final AccountService accountService;

}