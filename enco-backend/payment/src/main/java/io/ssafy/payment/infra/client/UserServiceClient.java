package io.ssafy.payment.infra.client;

import io.ssafy.payment.domain.vote.dto.request.PointUseRequestDto;
import io.ssafy.payment.global.common.response.CommonResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.math.BigDecimal;
import java.util.List;

@FeignClient(name = "auth-service", url = "${service.auth.url}")
public interface UserServiceClient {
    @GetMapping("/internal/groups/{groupId}/vote-criteria")
    CommonResponse<Integer> getVoteCriteria(@PathVariable Long groupId);

    @GetMapping("/internal/groups/{groupId}/member-count")
    CommonResponse<Integer> getGroupMemberCount(@PathVariable Long groupId);

    @GetMapping("/internal/users/{userId}/fcm-token")
    CommonResponse<String> getFcmToken(@PathVariable Long userId);

    @GetMapping("/internal/groups/{groupId}/members")
    CommonResponse<List<Long>> getGroupMembers(@PathVariable Long groupId);

    @GetMapping("/api/v1/users/{groupId}/points")
    CommonResponse<BigDecimal> getGroupPointBalance(@PathVariable Long groupId);

    @PostMapping("/api/v1/users/{groupId}/points/deduct")
    CommonResponse<Void> deductGroupPoint(
            @PathVariable Long groupId,
            @RequestBody PointUseRequestDto request
    );

    @PostMapping("/api/v1/users/{groupId}/points/refund")
    CommonResponse<Void> refundGroupPoint(
            @PathVariable("groupId") Long groupId,
            @RequestBody PointUseRequestDto request
    );

    @GetMapping("/api/v1/users/{groupId}/members/{userId}/check")
    CommonResponse<Boolean> checkGroupMember(
            @PathVariable("groupId") Long groupId,
            @PathVariable("userId") Long userId);
}