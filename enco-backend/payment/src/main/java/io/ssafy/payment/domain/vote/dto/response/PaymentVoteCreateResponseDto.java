package io.ssafy.payment.domain.vote.dto.response;

import io.ssafy.payment.domain.vote.entity.PaymentVote;
import io.ssafy.payment.domain.vote.entity.VoteStatus;


public record PaymentVoteCreateResponseDto(
        Long voteId,
        VoteStatus status,
        String expiredAt,
        String description
) {
    public static PaymentVoteCreateResponseDto from(PaymentVote vote) {
        return new PaymentVoteCreateResponseDto(
                vote.getId(),
                vote.getStatus(),
                vote.getExpiredAt().toString(),
                vote.getDescription()
        );
    }
}