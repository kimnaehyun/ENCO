package io.ssafy.payment.domain.vote.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.ssafy.payment.domain.vote.entity.VoteChoice;
import io.ssafy.payment.domain.vote.entity.VoteStatus;

import java.math.BigDecimal;
import java.util.List;

public record PaymentVoteDetailResponseDto(
        Long voteId,
        Long transactionId,
        String title,
        String description,
        BigDecimal amount,
        VoteStatus status,
        String expiredAt,
        int totalMembers,
        int votedCount,
        int approveCount,
        int rejectCount,
        List<VoteHistoryDto> histories
) {
    public record VoteHistoryDto(
            Long userId,
            VoteChoice choice
    ) {}
}