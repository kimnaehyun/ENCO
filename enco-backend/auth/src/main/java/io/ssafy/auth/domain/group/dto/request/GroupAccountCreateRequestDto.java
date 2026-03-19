package io.ssafy.auth.domain.group.dto.request;

import java.util.List;

public record GroupAccountCreateRequestDto(
        String name,
        String groupName,
        List<String> groupCategory,
        Long cardProductId,
        String password
) {}