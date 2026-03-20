package io.ssafy.payment.domain.card.service;

import io.ssafy.payment.domain.card.dto.response.CardProductDetailResponseDto;
import io.ssafy.payment.domain.card.dto.response.CardProductListResponseDto;
import io.ssafy.payment.domain.card.dto.response.GroupCardResponseDto;
import io.ssafy.payment.domain.card.entity.CardProduct;
import io.ssafy.payment.domain.card.repository.CardProductRepository;
import io.ssafy.payment.domain.card.repository.CardRepository;
import io.ssafy.payment.global.common.error.CustomException;
import io.ssafy.payment.global.common.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardProductRepository cardProductRepository;
    private final CardRepository cardRepository;

    @Transactional(readOnly = true)
    public List<CardProductListResponseDto> getAllCardProducts() {
        List<CardProduct> cards = cardProductRepository.findAllByIsDeletedFalse();

        return cards.stream()
                .map(CardProductListResponseDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public GroupCardResponseDto getGroupCard(Long groupId) {
        return cardRepository.findFirstByAccount_GroupIdAndIsBasicTrueAndIsDeletedFalse(groupId)
                .map(GroupCardResponseDto::from)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_CARD));
    }

    @Transactional(readOnly = true)
    public CardProductDetailResponseDto getCardProductDetail(Long cardProductId) {
        CardProduct card = cardProductRepository.findByIdAndIsDeletedFalse(cardProductId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_CARD));

        return CardProductDetailResponseDto.from(card);
    }
}