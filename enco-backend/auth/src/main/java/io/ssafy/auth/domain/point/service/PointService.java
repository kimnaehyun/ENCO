package io.ssafy.auth.domain.point.service;

import io.ssafy.auth.domain.group.entity.Group;
import io.ssafy.auth.domain.group.repository.GroupRepository;
import io.ssafy.auth.domain.point.entity.Direction;
import io.ssafy.auth.domain.point.entity.PointHistory;
import io.ssafy.auth.domain.point.repository.PointHistoryRepository;
import io.ssafy.auth.global.common.error.CustomException;
import io.ssafy.auth.global.common.error.ErrorCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class PointService {
    private final GroupRepository groupRepository;
    private final PointHistoryRepository pointHistoryRepository;

    @Transactional
    public boolean togglePointUsage(Long groupId, boolean status) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_GROUP));

        group.togglePoint(status);
        log.info("포인트 사용 유무= {}", status);
        return group.isPointEnabled();
    }

    public BigDecimal getGroupPoint(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_GROUP));

        log.info("그룹 포인트 = {}", group.getPoint());
        return group.getPoint();
    }

    @Transactional
    public void deductGroupPoint(Long groupId, BigDecimal amountToUse, Long voteId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_GROUP));

        if (group.getPoint().compareTo(amountToUse) < 0) {
            throw new CustomException(ErrorCode.INSUFFICIENT_POINT);
        }

        group.addPoint(amountToUse.negate());

        PointHistory history = PointHistory.builder()
                .groupId(groupId)
                .eventId(null)
                .amount(amountToUse)
                .balance(group.getPoint())
                .direction(Direction.OUT)
                .description("결제 투표 가결에 따른 포인트 사용")
                .referenceId(voteId)
                .build();

        pointHistoryRepository.save(history);
    }

    /**
     * 결제 실패 시 모임 포인트 환불/롤백 (Direction.IN)
     */
    @Transactional
    public void refundGroupPoint(Long groupId, BigDecimal amountToRefund, Long voteId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_GROUP));

        group.addPoint(amountToRefund);

        PointHistory history = PointHistory.builder()
                .groupId(groupId)
                .eventId(null)
                .referenceId(voteId)
                .amount(amountToRefund)
                .balance(group.getPoint())
                .direction(Direction.IN)
                .description("결제 실패로 인한 포인트 환불")
                .build();

        pointHistoryRepository.save(history);
    }
}
