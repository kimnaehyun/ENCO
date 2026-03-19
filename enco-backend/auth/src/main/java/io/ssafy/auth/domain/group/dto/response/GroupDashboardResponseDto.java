package io.ssafy.auth.domain.group.dto.response;

import io.ssafy.auth.domain.group.entity.Group;

import java.math.BigDecimal;

public record GroupDashboardResponseDto(
        String groupName,
        BigDecimal point
) {
    public static GroupDashboardResponseDto of(Group group) {
        return new GroupDashboardResponseDto(group.getName(), group.getPoint());
    }
}
