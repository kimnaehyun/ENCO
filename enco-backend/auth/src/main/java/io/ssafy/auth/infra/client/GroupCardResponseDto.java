package io.ssafy.auth.infra.client;

public record GroupCardResponseDto(
        Long cardId,
        String cardName,
        String frontCardImageUrl,
        String backCardImageUrl,
        Boolean isBasic
) {}
