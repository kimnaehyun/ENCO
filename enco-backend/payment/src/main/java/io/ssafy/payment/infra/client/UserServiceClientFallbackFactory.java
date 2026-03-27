package io.ssafy.payment.infra.client;

import io.ssafy.payment.domain.vote.dto.request.PointUseRequestDto;
import io.ssafy.payment.global.common.error.CustomException;
import io.ssafy.payment.global.common.error.ErrorCode;
import io.ssafy.payment.global.common.response.CommonResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
public class UserServiceClientFallbackFactory implements FallbackFactory<UserServiceClient> {

    @Override
    public UserServiceClient create(Throwable cause) {
        return new UserServiceClient() {

            @Override
            public CommonResponse<Integer> getVoteCriteria(Long groupId) {
                log.warn("[CircuitBreaker] Auth 서비스 응답 없음 - getVoteCriteria groupId={}: {}", groupId, cause.getMessage());
                throw new CustomException(ErrorCode.AUTH_SERVER_ERROR);
            }

            @Override
            public CommonResponse<Integer> getGroupMemberCount(Long groupId) {
                log.error("[CircuitBreaker] Auth 서비스 응답 없음 - getGroupMemberCount groupId={}: {}", groupId, cause.getMessage());
                throw new CustomException(ErrorCode.AUTH_SERVER_ERROR);
            }

            @Override
            public CommonResponse<String> getFcmToken(Long userId) {
                log.warn("[CircuitBreaker] Auth 서비스 응답 없음 - getFcmToken userId={}: {}", userId, cause.getMessage());
                return CommonResponse.success(null);
            }

            @Override
            public CommonResponse<List<Long>> getGroupMembers(Long groupId) {
                log.warn("[CircuitBreaker] Auth 서비스 응답 없음 - getGroupMembers groupId={}: {}", groupId, cause.getMessage());
                return CommonResponse.success(List.of());
            }

            @Override
            public CommonResponse<BigDecimal> getGroupPointBalance(Long groupId) {
                log.warn("[CircuitBreaker] Auth 서비스 응답 없음 - getGroupPointBalance groupId={}: {}", groupId, cause.getMessage());
                throw new CustomException(ErrorCode.AUTH_SERVER_ERROR);
            }

            @Override
            public CommonResponse<Void> deductGroupPoint(Long groupId, PointUseRequestDto request) {
                log.error("[CircuitBreaker] Auth 서비스 응답 없음 - deductGroupPoint groupId={}: {}", groupId, cause.getMessage());
                throw new CustomException(ErrorCode.POINT_SYSTEM_ERROR);
            }

            @Override
            public CommonResponse<Void> refundGroupPoint(Long groupId, PointUseRequestDto request) {
                log.error("[CircuitBreaker] Auth 서비스 응답 없음 - refundGroupPoint groupId={}: {}", groupId, cause.getMessage());
                throw new CustomException(ErrorCode.POINT_SYSTEM_ERROR);
            }

            @Override
            public CommonResponse<Boolean> checkGroupMember(Long groupId, Long userId) {
                log.warn("[CircuitBreaker] Auth 서비스 응답 없음 - checkGroupMember groupId={}, userId={}: {}", groupId, userId, cause.getMessage());
                throw new CustomException(ErrorCode.AUTH_SERVER_ERROR);
            }
        };
    }
}
