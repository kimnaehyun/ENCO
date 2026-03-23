package io.ssafy.payment.domain.vote.controller;

import io.ssafy.payment.domain.vote.dto.request.PaymentVoteChoiceRequestDto;
import io.ssafy.payment.domain.vote.dto.request.PaymentVoteCreateRequestDto;
import io.ssafy.payment.domain.vote.dto.response.PaymentVoteCreateResponseDto;
import io.ssafy.payment.domain.vote.dto.response.PaymentVoteDetailResponseDto;
import io.ssafy.payment.domain.vote.dto.response.PaymentVoteListResponseDto;
import io.ssafy.payment.domain.vote.service.PaymentVoteService;
import io.ssafy.payment.global.common.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/votes")
@RequiredArgsConstructor
public class PaymentVoteController {

    private final PaymentVoteService voteService;

    // 투표 생성
    @PostMapping
    public ResponseEntity<CommonResponse<PaymentVoteCreateResponseDto>> createVote(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody PaymentVoteCreateRequestDto request) {
        return ResponseEntity.ok(CommonResponse.success(voteService.createVote(userId, request)));
    }

    @GetMapping("/groups/{groupId}")
    public ResponseEntity<CommonResponse<List<PaymentVoteListResponseDto>>> getVoteList(
            @PathVariable Long groupId) {
        return ResponseEntity.ok(CommonResponse.success(voteService.getVoteList(groupId)));
    }

    @GetMapping("/{voteId}/groups/{groupId}")
    public ResponseEntity<CommonResponse<PaymentVoteDetailResponseDto>> getVoteDetail(
            @PathVariable Long voteId,
            @PathVariable Long groupId) {
        return ResponseEntity.ok(CommonResponse.success(voteService.getVoteDetail(voteId, groupId)));
    }

    @PostMapping("/{voteId}/choice")
    public ResponseEntity<CommonResponse<Void>> vote(
            @PathVariable Long voteId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody PaymentVoteChoiceRequestDto request) {
        voteService.vote(voteId, userId, request);
        return ResponseEntity.ok(CommonResponse.success());
    }
}