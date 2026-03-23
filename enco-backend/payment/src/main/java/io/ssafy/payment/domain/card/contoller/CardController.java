package io.ssafy.payment.domain.card.contoller;

import io.ssafy.payment.domain.card.dto.response.CardListResponseDto;
import io.ssafy.payment.domain.card.dto.response.CardProductDetailResponseDto;
import io.ssafy.payment.domain.card.dto.response.CardProductListResponseDto;
import io.ssafy.payment.domain.card.service.CardService;
import io.ssafy.payment.global.common.response.CommonResponse;
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
    public ResponseEntity<CommonResponse<List<CardProductListResponseDto>>> getAllCardProducts() {
        return ResponseEntity.ok(CommonResponse.success(cardProductService.getAllCardProducts()));
    }

    @GetMapping("/{cardProductId}")
    public ResponseEntity<CommonResponse<CardProductDetailResponseDto>> getCardProductDetail(
            @PathVariable("cardProductId") Long cardProductId) {
        return ResponseEntity.ok(CommonResponse.success(cardProductService.getCardProductDetail(cardProductId)));
    }

    /**
     * 내가 속한 모임 리스트 조회(대표 카드 반환)
     * @param groupId
     * @return
     */
    @GetMapping("/groups/{groupId}/cards")
    public ResponseEntity<CommonResponse<List<CardListResponseDto>>> getGroupCards(
            @PathVariable Long groupId) {
        return ResponseEntity.ok(
                CommonResponse.success(cardProductService.getGroupCardList(groupId))
        );
    }

    /**
     * 카드 추천 목록
     * @param categories
     * @return
     */
    @GetMapping("/recommend")
    public ResponseEntity<CommonResponse<List<CardProductDetailResponseDto>>> recommendCards(
            @RequestParam("categories") List<String> categories) {

        List<CardProductDetailResponseDto> recommendations = cardProductService.getRecommendedCards(categories);
        return ResponseEntity.ok(CommonResponse.success(recommendations));
    }

    @PatchMapping("/groups/{groupId}/cards/{cardId}/basic")
    public ResponseEntity<CommonResponse<Void>> updateBasicCard(
            @PathVariable Long groupId,
            @PathVariable Long cardId) {
        cardProductService.updateBasicCard(groupId, cardId);
        return ResponseEntity.ok(CommonResponse.success());
    }

}