package io.ssafy.chat.infra.client;

import io.ssafy.chat.global.common.response.CommonResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "auth-service", url = "${service.auth.url}")
public interface AuthServiceClient {

    @GetMapping("/api/v1/users/internal/{userId}/fcm-token")
    CommonResponse<String> getFcmToken(@PathVariable Long userId);

    @GetMapping("/internal/groups/{groupId}/members")
    CommonResponse<List<Long>> getGroupMembers(@PathVariable Long groupId);

    @GetMapping("/api/v1/users/internal/batch")
    CommonResponse<List<UserDetailDto>> getUserDetails(@RequestParam List<Long> userIds);
}
