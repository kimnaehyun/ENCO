package io.ssafy.payment.domain.ai.controller;

import io.ssafy.payment.domain.ai.dto.request.ReceiptParseRequestDto;
import io.ssafy.payment.domain.ai.dto.response.ReceiptParseResponseDto;
import io.ssafy.payment.domain.ai.service.AiService;
import io.ssafy.payment.global.common.response.CommonResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/receipt/parse")
    public ResponseEntity<CommonResponse<ReceiptParseResponseDto>> parseReceipt(
            @RequestBody ReceiptParseRequestDto request
    ) {
        return ResponseEntity.ok(CommonResponse.success(aiService.parseReceipt(request)));
    }
}
