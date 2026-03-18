package io.ssafy.auth.domain.group.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;
import java.util.List;

public record UpdateGroupSettingRequestDto(
        String name,
        String introduction,
        List<Long> typeIds,
        DuePolicySettingDto duePolicy,
        String groundRule
) {
    public record DuePolicySettingDto(
            @DecimalMin(value = "0.01", message = "회비 금액은 0보다 커야 합니다.")
            BigDecimal amount,

            @Min(value = 1, message = "납부일은 1 이상이어야 합니다.")
            @Max(value = 28, message = "납부일은 28 이하이어야 합니다.")
            Integer dayOfMonth,

            @Min(value = 0, message = "투표 기준은 0 이상이어야 합니다.")
            @Max(value = 100, message = "투표 기준은 100 이하이어야 합니다.")
            Integer voteCriteria
    ) {}
}
