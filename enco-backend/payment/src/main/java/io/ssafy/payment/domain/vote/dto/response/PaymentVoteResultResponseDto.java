package io.ssafy.payment.domain.vote.dto.response;

import io.ssafy.payment.domain.vote.entity.VoteStatus;

public record PaymentVoteResultResponseDto(
        Long voteId,
        VoteStatus status,
        String message
) {
    public static PaymentVoteResultResponseDto of(Long voteId, VoteStatus status, String message) {
        return new PaymentVoteResultResponseDto(voteId, status, message);
    }
}