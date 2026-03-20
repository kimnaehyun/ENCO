package io.ssafy.auth.infra.client;

import io.ssafy.auth.domain.group.dto.request.PaymentCreateRequestDto;
import io.ssafy.auth.domain.group.dto.response.PaymentCreateResponseDto;
import io.ssafy.auth.global.common.response.CommonResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "payment-service", url = "${service.payment.url}")
public interface PaymentServiceClient {

    @PostMapping("/api/v1/internal/payments/group-account")
    CommonResponse<PaymentCreateResponseDto> createAccountAndCard(@RequestBody PaymentCreateRequestDto request);

    @GetMapping("/api/v1/internal/payments/groups/{groupId}/card")
    CommonResponse<GroupCardResponseDto> getGroupCard(@PathVariable("groupId") Long groupId);
}
