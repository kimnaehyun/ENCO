package io.ssafy.auth.domain.group.service;

import io.ssafy.auth.domain.group.dto.request.GroupAccountCreateRequestDto;
import io.ssafy.auth.domain.group.dto.response.GroupAccountCreateResponseDto;
import io.ssafy.auth.domain.group.dto.response.TypeResponseDto;
import io.ssafy.auth.domain.group.entity.Group;
import io.ssafy.auth.domain.group.entity.GroupUser;
import io.ssafy.auth.domain.group.entity.Role;
import io.ssafy.auth.domain.group.entity.Type;
import io.ssafy.auth.domain.group.repository.GroupRepository;
import io.ssafy.auth.domain.group.repository.GroupUserRepository;
import io.ssafy.auth.domain.group.repository.TypeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class GroupCreateService {
    private final GroupRepository groupRepository;
    private final GroupUserRepository groupUserRepository;
    private final TypeRepository typeRepository;

    public List<TypeResponseDto> typeList() {
        List<Type> types = typeRepository.findAll();
        return types.stream()
                .map(TypeResponseDto::from)
                .toList();
    }

    public void createType(String type) {
        Type t = new Type();
        t.setName(type);
        typeRepository.save(t);
    }
}
