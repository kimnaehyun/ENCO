package io.ssafy.payment.domain.vote.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.ssafy.payment.domain.vote.entity.PaymentVote;
import io.ssafy.payment.domain.vote.entity.VoteStatus;

import java.time.LocalDateTime;

public record PaymentVoteCreateResponseDto(
        Long voteId,
        VoteStatus status,
        String expiredAt
) {
    public static PaymentVoteCreateResponseDto from(PaymentVote vote) {
        return new PaymentVoteCreateResponseDto(
                vote.getId(),
                vote.getStatus(),
                vote.getExpiredAt().toString()
        );
    }
}