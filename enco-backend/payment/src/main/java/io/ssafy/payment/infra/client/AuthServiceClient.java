package io.ssafy.payment.infra.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.ssafy.payment.global.common.error.CustomException;
import io.ssafy.payment.global.common.error.ErrorCode;
import io.ssafy.payment.global.common.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthServiceClient {

    private final RestTemplate restTemplate;

    @Value("${service.auth.url}")
    private String authServiceUrl;

    @CircuitBreaker(name = "authServiceClient", fallbackMethod = "getActiveMemberIdsFallback")
    public List<Long> getActiveMemberIds(Long groupId) {
        String url = authServiceUrl + "/api/v1/groups/" + groupId + "/members";

        CommonResponse<List<GroupMemberResponse>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<CommonResponse<List<GroupMemberResponse>>>() {}
        ).getBody();

        if (response == null || response.result() == null) return List.of();
        return response.result().stream().map(GroupMemberResponse::userId).toList();
    }

    private List<Long> getActiveMemberIdsFallback(Long groupId, Throwable t) {
        log.error("[CircuitBreaker] Auth 서비스 응답 없음 - getActiveMemberIds groupId={}: {}", groupId, t.getMessage());
        throw new CustomException(ErrorCode.AUTH_SERVER_ERROR);
    }

    @CircuitBreaker(name = "authServiceClient", fallbackMethod = "getGroupDashboardInfoFallback")
    public GroupInfoResponse getGroupDashboardInfo(Long groupId) {
        String url = authServiceUrl + "/api/v1/groups/" + groupId + "/dashboard";

        CommonResponse<GroupInfoResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<CommonResponse<GroupInfoResponse>>() {}
        ).getBody();

        if (response == null || response.result() == null) {
            return new GroupInfoResponse("알 수 없는 모임", BigDecimal.ZERO);
        }
        return response.result();
    }

    private GroupInfoResponse getGroupDashboardInfoFallback(Long groupId, Throwable t) {
        log.warn("[CircuitBreaker] Auth 서비스 응답 없음 - getGroupDashboardInfo groupId={}: {}", groupId, t.getMessage());
        return new GroupInfoResponse("알 수 없는 모임", BigDecimal.ZERO);
    }

    @CircuitBreaker(name = "authServiceClient", fallbackMethod = "getTodayActivePoliciesFallback")
    public List<ActiveDuePolicyResponse> getTodayActivePolicies() {
        String url = authServiceUrl + "/api/v1/internal/due-policies/today";

        CommonResponse<List<ActiveDuePolicyResponse>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<CommonResponse<List<ActiveDuePolicyResponse>>>() {}
        ).getBody();

        if (response == null || response.result() == null) return List.of();
        return response.result();
    }

    private List<ActiveDuePolicyResponse> getTodayActivePoliciesFallback(Throwable t) {
        log.warn("[CircuitBreaker] Auth 서비스 응답 없음 - getTodayActivePolicies: {}", t.getMessage());
        return List.of();
    }

    @CircuitBreaker(name = "authServiceClient", fallbackMethod = "getPointHistoriesFallback")
    public List<PointHistoryResponse> getPointHistories(Long groupId, Long cursor, int size, String sort, String direction) {
        StringBuilder url = new StringBuilder(authServiceUrl + "/api/v1/internal/groups/" + groupId + "/point-histories")
                .append("?size=").append(size)
                .append("&sort=").append(sort);
        if (cursor != null) url.append("&cursor=").append(cursor);
        if (direction != null) url.append("&direction=").append(direction);
        String finalUrl = url.toString();

        CommonResponse<List<PointHistoryResponse>> response = restTemplate.exchange(
                finalUrl,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<CommonResponse<List<PointHistoryResponse>>>() {}
        ).getBody();

        if (response == null || response.result() == null) return List.of();
        return response.result();
    }

    private List<PointHistoryResponse> getPointHistoriesFallback(Long groupId, Long cursor, int size, String sort, String direction, Throwable t) {
        log.warn("[CircuitBreaker] Auth 서비스 응답 없음 - getPointHistories groupId={}: {}", groupId, t.getMessage());
        return List.of();
    }

    @CircuitBreaker(name = "authServiceClient", fallbackMethod = "getMemberDetailsFallback")
    public List<UserDetailResponse> getMemberDetails(List<Long> userIds) {
        String url = authServiceUrl + "/api/v1/users/internal/batch?userIds=" +
                userIds.stream().map(String::valueOf).collect(java.util.stream.Collectors.joining(","));

        CommonResponse<List<UserDetailResponse>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<CommonResponse<List<UserDetailResponse>>>() {}
        ).getBody();

        if (response == null || response.result() == null) return List.of();
        return response.result();
    }

    private List<UserDetailResponse> getMemberDetailsFallback(List<Long> userIds, Throwable t) {
        log.warn("[CircuitBreaker] Auth 서비스 응답 없음 - getMemberDetails: {}", t.getMessage());
        return List.of();
    }

    public record GroupMemberResponse(Long userId, String role) {}

    public record GroupInfoResponse(String groupName, BigDecimal point) {}

    public record ActiveDuePolicyResponse(Long policyId, Long groupId, BigDecimal amount) {}

    public record PointHistoryResponse(Long id, BigDecimal amount, BigDecimal balance, String direction, String description, LocalDateTime createdAt) {}

    public record UserDetailResponse(Long userId, String name, Integer profileImage) {}
}
