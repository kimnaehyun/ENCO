package io.ssafy.auth.domain.group.dto.response;

import io.ssafy.auth.domain.group.entity.Type;

public record TypeResponseDto(Long typeId, String typeName) {
    public static TypeResponseDto from(Type Type) {
        return new TypeResponseDto(Type.getId(), Type.getName());
    }
}
