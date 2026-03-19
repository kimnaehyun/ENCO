package io.ssafy.auth.domain.group.controller;

import io.ssafy.auth.domain.group.dto.response.TypeResponseDto;
import io.ssafy.auth.domain.group.service.GroupCreateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
public class GroupCreateController {
    private final GroupCreateService groupCreateService;

    @GetMapping("/types")
    public ResponseEntity<List<TypeResponseDto>> typeList() {
        return ResponseEntity.ok(groupCreateService.typeList());
    }

    @PostMapping("/types")
    public ResponseEntity<Void> createType(@RequestParam("typeName") String typeName) {
        groupCreateService.createType(typeName);
        return ResponseEntity.ok().build();
    }
}
