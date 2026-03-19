package io.ssafy.auth.domain.group.service;

import io.ssafy.auth.domain.group.dto.response.GroupDashboardResponseDto;
import io.ssafy.auth.domain.group.repository.GroupRepository;
import io.ssafy.auth.global.common.error.CustomException;
import io.ssafy.auth.global.common.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GroupDashboardService {

    private final GroupRepository groupRepository;

    @Transactional(readOnly = true)
    public GroupDashboardResponseDto getDashboardInfo(Long groupId) {
        var group = groupRepository.findById(groupId)
                .filter(g -> !g.getIsDeleted())
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        return GroupDashboardResponseDto.of(group);
    }
}
