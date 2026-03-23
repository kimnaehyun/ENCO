package io.ssafy.payment.domain.vote.dto.request;

import io.ssafy.payment.domain.vote.entity.VoteChoice;

public record PaymentVoteChoiceRequestDto(
        VoteChoice choice
) {}