package io.ssafy.auth.domain.group.dto.response;

public record GroupAccountCreateResponseDto(
        Long groupId,
        String groupName,
        Long accountId,
        String accountNumber,
        Long cardId,
        String chatRoomId
) {}