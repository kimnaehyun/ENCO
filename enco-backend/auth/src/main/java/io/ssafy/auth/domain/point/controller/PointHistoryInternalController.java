package io.ssafy.auth.domain.point.controller;

import io.ssafy.auth.domain.point.entity.Direction;
import io.ssafy.auth.domain.point.entity.PointHistory;
import io.ssafy.auth.domain.point.repository.PointHistoryRepository;
import io.ssafy.auth.global.common.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@RestController
@RequestMapping("/api/v1/internal/groups")
@RequiredArgsConstructor
public class PointHistoryInternalController {

    private final PointHistoryRepository pointHistoryRepository;

    @GetMapping("/{groupId}/point-histories")
    public ResponseEntity<CommonResponse<List<PointHistoryResponse>>> getPointHistories(
            @PathVariable Long groupId,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "21") int size,
            @RequestParam(defaultValue = "LATEST") String sort,
            @RequestParam(required = false) String direction
    ) {
        LocalDateTime cursorTime = cursor != null
                ? LocalDateTime.ofInstant(Instant.ofEpochMilli(cursor), ZoneOffset.UTC)
                : null;

        Direction dir = direction != null ? Direction.valueOf(direction) : null;

        List<PointHistory> histories = "OLDEST".equals(sort)
                ? pointHistoryRepository.findOldestWithCursor(groupId, dir, cursorTime, size)
                : pointHistoryRepository.findLatestWithCursor(groupId, dir, cursorTime, size);

        List<PointHistoryResponse> result = histories.stream()
                .map(PointHistoryResponse::from)
                .toList();

        return ResponseEntity.ok(CommonResponse.success(result));
    }

    public record PointHistoryResponse(
            Long id,
            BigDecimal amount,
            BigDecimal balance,
            String direction,
            String description,
            LocalDateTime createdAt
    ) {
        public static PointHistoryResponse from(PointHistory h) {
            return new PointHistoryResponse(
                    h.getId(),
                    h.getAmount(),
                    h.getBalance(),
                    h.getDirection().name(),
                    h.getDescription(),
                    h.getCreatedAt()
            );
        }
    }
}
