package io.ssafy.payment.domain.vote.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.ssafy.payment.domain.vote.entity.PaymentVote;
import io.ssafy.payment.domain.vote.entity.VoteStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentVoteListResponseDto(
        Long voteId,
        String title,
        BigDecimal amount,
        VoteStatus status,
        String expiredAt,
        int totalMembers,
        int votedCount
) {
    public static PaymentVoteListResponseDto of(PaymentVote vote, int votedCount) {
        return new PaymentVoteListResponseDto(
                vote.getId(),
                vote.getTitle(),
                vote.getAmount(),
                vote.getStatus(),
                vote.getExpiredAt().toString(),
                vote.getTotalMembers(),
                votedCount
        );
    }
}