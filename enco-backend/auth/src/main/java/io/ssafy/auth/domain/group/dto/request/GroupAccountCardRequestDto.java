package io.ssafy.auth.domain.group.dto.request;


import java.math.BigDecimal;

public record GroupAccountCardRequestDto(Long accountId,
                                         AccountInfo account,
                                         CardInfo card
) {
    public record AccountInfo(
            Long accountId,
            String accountNumber,
            BigDecimal balance
    ) {
    }

    public record CardInfo(
            Long cardId,
            String frontImageUrl
    ) {
    }

}