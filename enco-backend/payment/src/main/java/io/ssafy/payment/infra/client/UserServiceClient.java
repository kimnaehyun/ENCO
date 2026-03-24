package io.ssafy.payment.infra.client;

import io.ssafy.payment.global.common.response.CommonResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "auth-service", url = "${service.auth.url}")
public interface UserServiceClient {
    @GetMapping("/internal/groups/{groupId}/vote-criteria")
    CommonResponse<Integer> getVoteCriteria(@PathVariable Long groupId);

    @GetMapping("/internal/groups/{groupId}/member-count")
    CommonResponse<Integer> getGroupMemberCount(@PathVariable Long groupId);
}