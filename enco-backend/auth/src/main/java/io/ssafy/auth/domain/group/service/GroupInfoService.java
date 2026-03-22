package io.ssafy.auth.domain.group.service;

import io.ssafy.auth.domain.group.dto.response.MyGroupResponseDto;
import io.ssafy.auth.domain.group.entity.Group;
import io.ssafy.auth.domain.group.entity.GroupUser;
import io.ssafy.auth.domain.group.repository.GroupUserRepository;
import io.ssafy.auth.domain.group.dto.request.GroupAccountCardRequestDto;
import io.ssafy.auth.infra.client.PaymentServiceClient;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupInfoService {
    private final GroupUserRepository groupUserRepository;
    private final PaymentServiceClient paymentFeignClient;

    public List<MyGroupResponseDto> getMyGroups(Long userId) {
        // 1. 내가 속한 모임 + 역할 조회
        List<GroupUser> myGroupUsers = groupUserRepository
                .findByUserIdAndIsDeletedFalse(userId);

        // 2. accountId 추출
        List<Long> accountIds = myGroupUsers.stream()
                .map(gu -> gu.getGroup().getAccountId())
                .toList();

        // 3. Payment에서 계좌 + 대표카드 일괄 조회
        Map<Long, GroupAccountCardRequestDto> accountCardMap = paymentFeignClient
                .getAccountsByIds(accountIds)
                .result()
                .stream()
                .collect(Collectors.toMap(GroupAccountCardRequestDto::accountId, dto -> dto));

        // 4. 조합
        return myGroupUsers.stream()
                .map(gu -> MyGroupResponseDto.of(
                        gu,
                        accountCardMap.get(gu.getGroup().getAccountId())
                ))
                .toList();
    }
}
