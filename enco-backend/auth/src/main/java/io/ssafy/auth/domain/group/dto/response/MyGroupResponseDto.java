package io.ssafy.auth.domain.group.dto.response;

public record MyGroupResponseDto(Long groupId, String groupName, CardInfoDto cardInfoDto) {
    public record CardInfoDto(Long cardId, String frontImageUrl) {}
}
