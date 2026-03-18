package io.ssafy.auth.domain.group.dto.request;

import io.ssafy.auth.domain.group.entity.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateMemberRoleRequestDto(

        @NotNull(message = "역할은 필수입니다.")
        Role role
) {
}
