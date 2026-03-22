package io.ssafy.payment.domain.account.dto.response;

import io.ssafy.payment.domain.account.dto.request.GroupAccountCardRequestDto;
import io.ssafy.payment.domain.account.entity.Account;
import io.ssafy.payment.domain.card.entity.Card;

import java.math.BigDecimal;

public record GroupAccountCardResponseDto(Long accountId,
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

    public static GroupAccountCardResponseDto from(Account account) {
        Card basicCard = account.getCardList().stream()
                .filter(c -> c.getIsBasic() && !c.getIsDeleted())
                .findFirst()
                .orElse(null);

        return new GroupAccountCardResponseDto(
                account.getId(),
                new AccountInfo(
                        account.getId(),
                        account.getAccountNumber(),
                        account.getAmount()
                ),
                basicCard == null ? null : new CardInfo(
                        basicCard.getId(),
                        basicCard.getCardProduct().getFrontImageUrl()
                )
        );
    }
}
