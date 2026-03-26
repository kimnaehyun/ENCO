package io.ssafy.payment.domain.vote.dto.request;

import java.math.BigDecimal;

public record PointUseRequestDto(
        BigDecimal amount,
        Long voteId
) {}
