package io.ssafy.payment.infra.client;

import io.ssafy.payment.global.common.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AuthServiceClient {

    private final RestTemplate restTemplate;

    @Value("${service.auth.url}")
    private String authServiceUrl;

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

    public record GroupMemberResponse(Long userId, String role) {}

    public record GroupInfoResponse(String groupName, BigDecimal point) {}

    public record ActiveDuePolicyResponse(Long policyId, Long groupId, BigDecimal amount) {}

    public record PointHistoryResponse(Long id, BigDecimal amount, BigDecimal balance, String direction, String description, LocalDateTime createdAt) {}

    public record UserDetailResponse(Long userId, String name, Integer profileImage) {}
}
