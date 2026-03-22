package io.ssafy.payment.domain.account.dto.request;

public record CardIssueRequestDto(
        Long accountId,
        Long cardProductId
) {}

