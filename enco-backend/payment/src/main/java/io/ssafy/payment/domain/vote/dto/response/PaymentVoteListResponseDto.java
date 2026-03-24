package io.ssafy.payment.domain.vote.dto.response;

import io.ssafy.payment.domain.vote.entity.PaymentVote;
import io.ssafy.payment.domain.vote.entity.VoteStatus;


public record PaymentVoteListResponseDto(
        Long voteId,
        String title,
        VoteStatus status,
        String expiredAt,
        int totalMembers,
        int votedCount
) {
    public static PaymentVoteListResponseDto of(PaymentVote vote, int votedCount) {
        return new PaymentVoteListResponseDto(
                vote.getId(),
                vote.getTitle(),
                vote.getStatus(),
                vote.getExpiredAt().toString(),
                vote.getTotalMembers(), //총 모임 수
                votedCount // 투표 수
        );
    }
}