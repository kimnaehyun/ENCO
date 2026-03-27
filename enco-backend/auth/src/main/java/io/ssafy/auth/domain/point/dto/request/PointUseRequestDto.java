package io.ssafy.auth.domain.point.dto.request;

import java.math.BigDecimal;

public record PointUseRequestDto(
        BigDecimal amount,
        Long voteId
) {}
