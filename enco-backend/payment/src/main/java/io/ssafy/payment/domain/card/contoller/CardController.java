package io.ssafy.payment.domain.card.contoller;

import io.ssafy.payment.domain.card.dto.response.CardProductDetailResponseDto;
import io.ssafy.payment.domain.card.dto.response.CardProductListResponseDto;
import io.ssafy.payment.domain.card.service.CardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardProductService;

    @GetMapping
    public ResponseEntity<List<CardProductListResponseDto>> getAllCardProducts() {
        return ResponseEntity.ok(cardProductService.getAllCardProducts());
    }

    @GetMapping("/{cardProductId}")
    public ResponseEntity<CardProductDetailResponseDto> getCardProductDetail(
            @PathVariable("cardProductId") Long cardProductId) {
        return ResponseEntity.ok(cardProductService.getCardProductDetail(cardProductId));
    }
}