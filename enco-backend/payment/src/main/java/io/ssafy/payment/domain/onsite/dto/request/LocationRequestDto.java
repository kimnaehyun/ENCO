package io.ssafy.payment.domain.onsite.dto.request;

public record LocationRequestDto(
        double latitude,
        double longitude,
        boolean isLeader
) {}