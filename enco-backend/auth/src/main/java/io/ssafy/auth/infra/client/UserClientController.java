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
}
