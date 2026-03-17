package io.ssafy.payment.infra.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AuthServiceClient {

    private final RestTemplate restTemplate;

    @Value("${service.auth.url}")
    private String authServiceUrl;

    public List<Long> getActiveMemberIds(Long groupId) {
        String url = authServiceUrl + "/api/v1/groups/" + groupId + "/members";

        List<GroupMemberResponse> members = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<GroupMemberResponse>>() {}
        ).getBody();

        if (members == null) return List.of();
        return members.stream().map(GroupMemberResponse::userId).toList();
    }

    public record GroupMemberResponse(Long userId, String role) {}
}
