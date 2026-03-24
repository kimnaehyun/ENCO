package io.ssafy.chat.infra.client;

import io.ssafy.chat.global.common.response.CommonResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "auth-service", url = "${service.auth.url}")
public interface AuthServiceClient {

    @GetMapping("/api/v1/users/internal/{userId}/fcm-token")
    CommonResponse<String> getFcmToken(@PathVariable Long userId);
}
