package io.ssafy.payment.infra.client;

import io.ssafy.payment.global.common.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
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

    public record GroupMemberResponse(Long userId, String role) {}

    public record GroupInfoResponse(String groupName, BigDecimal point) {}

    public record ActiveDuePolicyResponse(Long policyId, Long groupId, BigDecimal amount) {}
}
