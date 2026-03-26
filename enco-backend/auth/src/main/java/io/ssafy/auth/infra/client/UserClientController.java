package io.ssafy.auth.infra.client;

import io.ssafy.auth.domain.group.repository.GroupRepository;
import io.ssafy.auth.domain.group.repository.GroupUserRepository;
import io.ssafy.auth.global.common.error.CustomException;
import io.ssafy.auth.global.common.error.ErrorCode;
import io.ssafy.auth.global.common.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/internal/groups")
@RequiredArgsConstructor
public class UserClientController {
    private final GroupRepository groupRepository;
    private final GroupUserRepository groupUserRepository;

    @GetMapping("/{groupId}/vote-criteria")
    public ResponseEntity<CommonResponse<Integer>> getVoteCriteria(@PathVariable Long groupId) {
        return ResponseEntity.ok(CommonResponse.success(
                groupRepository.findById(groupId)
                        .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND))
                        .getVoteCriteria()
        ));
    }

    @GetMapping("/{groupId}/member-count")
    public ResponseEntity<CommonResponse<Integer>> getMemberCount(@PathVariable Long groupId) {
        return ResponseEntity.ok(CommonResponse.success(
                groupUserRepository.countByGroup_IdAndIsDeletedFalse(groupId)
        ));
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<CommonResponse<List<Long>>> getGroupMembers(@PathVariable Long groupId) {

        // 주의: groupUserRepository에 findByGroup_IdAndIsDeletedFalse 메서드가 없다면 추가해 주셔야 합니다!
        List<Long> memberIds = groupUserRepository.findByGroup_IdAndIsDeletedFalse(groupId)
                .stream()
                .map(groupUser -> groupUser.getUser().getId()) // ⭐️ 모임원 정보에서 유저 ID만 쏙쏙 뽑아냅니다
                .toList();

        return ResponseEntity.ok(CommonResponse.success(memberIds));
    }
}
