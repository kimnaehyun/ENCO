package io.ssafy.payment.domain.vote.service;

import io.ssafy.payment.domain.account.entity.Account;
import io.ssafy.payment.domain.account.repository.AccountRepository;
import io.ssafy.payment.domain.card.entity.Card;
import io.ssafy.payment.domain.card.repository.CardRepository;
import io.ssafy.payment.domain.transaction.entity.Direction;
import io.ssafy.payment.domain.transaction.entity.Status;
import io.ssafy.payment.domain.transaction.entity.TransactionHistory;
import io.ssafy.payment.domain.transaction.entity.Type;
import io.ssafy.payment.domain.transaction.repository.TransactionHistoryRepository;
import io.ssafy.payment.domain.vote.dto.request.PaymentVoteChoiceRequestDto;
import io.ssafy.payment.domain.vote.dto.request.PaymentVoteCreateRequestDto;
import io.ssafy.payment.domain.vote.dto.response.PaymentVoteCreateResponseDto;
import io.ssafy.payment.domain.vote.dto.response.PaymentVoteDetailResponseDto;
import io.ssafy.payment.domain.vote.dto.response.PaymentVoteListResponseDto;
import io.ssafy.payment.domain.vote.dto.response.PaymentVoteResultResponseDto;
import io.ssafy.payment.domain.vote.entity.PaymentVote;
import io.ssafy.payment.domain.vote.entity.PaymentVoteHistory;
import io.ssafy.payment.domain.vote.entity.VoteChoice;
import io.ssafy.payment.domain.vote.entity.VoteStatus;
import io.ssafy.payment.domain.vote.repository.PaymentVoteHistoryRepository;
import io.ssafy.payment.domain.vote.repository.PaymentVoteRepository;
import io.ssafy.payment.global.common.error.CustomException;
import io.ssafy.payment.global.common.error.ErrorCode;
import io.ssafy.payment.infra.client.UserServiceClient;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentVoteService {

    private final PaymentVoteRepository voteRepository;
    private final PaymentVoteHistoryRepository historyRepository;
    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final UserServiceClient userServiceClient;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public PaymentVoteCreateResponseDto createVote(PaymentVoteCreateRequestDto request, String idempotencyKey) {
        Account account = accountRepository.findByGroupId(request.groupId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_ACCOUNT));

        if (!passwordEncoder.matches(request.password(), account.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }

        Card card = cardRepository.findById(request.cardId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_CARD));

        Integer totalMembersResult = null;
        try {
            totalMembersResult = userServiceClient.getGroupMemberCount(request.groupId()).result();
        } catch (Exception e) {
            log.warn("[PaymentVote] Auth 서버 통신 오류로 모임원 수를 가져오지 못했습니다.", e);
        }
        int totalMembers = (totalMembersResult != null) ? totalMembersResult : 0;

        PaymentVote vote = PaymentVote.builder()
                .groupId(request.groupId())
                .title(request.title())
                .description(request.description())
                .totalMembers(totalMembers)
                .status(VoteStatus.VOTING)
                .expiredAt(LocalDateTime.now().plusHours(1))
                .build();
        PaymentVote savedVote = voteRepository.saveAndFlush(vote);

        BigDecimal totalAmount = request.amount();
        BigDecimal usedPoint = BigDecimal.ZERO;

//        try {
////            usedPoint = userServiceClient.useGroupPoint(request.groupId(), totalAmount, savedVote.getId()).result();
////            if (usedPoint == null) usedPoint = BigDecimal.ZERO;
//        } catch (Exception e) {
//            log.warn("[PaymentVote] 포인트 차감 실패 (Auth 서버 통신 오류). 전액 현금 청구됨.", e);
//        }

        BigDecimal finalCashAmount = totalAmount.subtract(usedPoint);

        TransactionHistory pendingTransaction = TransactionHistory.builder()
                .accountId(account.getId())
                .cardId(card.getId())
                .voteId(savedVote.getId())
                .counterpartyBankAccountNumber(request.counterpartyBankAccountNumber())
                .counterpartyBankName(request.counterpartyBankName())
                .counterpartyName(request.counterpartyName())
                .amount(finalCashAmount)
                .displayName(request.counterpartyName())
                .type(Type.CARD_PAYMENT)
                .direction(Direction.OUT)
                .status(Status.PENDING)
                .idempotencyKey(idempotencyKey)
                .build();
        transactionHistoryRepository.save(pendingTransaction);

        log.info("[PaymentVote] 투표 생성 완료: 총금액={}, 사용포인트={}, 청구현금={}", totalAmount, usedPoint, finalCashAmount);
        return PaymentVoteCreateResponseDto.from(savedVote);
    }

    /**
     * 투표 리스트 조회
     *
     * @param groupId
     * @return
     */
    public List<PaymentVoteListResponseDto> getVoteList(Long groupId) {
        return voteRepository.findByGroupId(groupId)
                .stream()
                .map(vote -> {
                    if (vote.getStatus() == VoteStatus.VOTING
                            && vote.getExpiredAt() != null
                            && LocalDateTime.now().isAfter(vote.getExpiredAt())) {

                        vote.expire();
                        voteRepository.save(vote);
                    }

                    return PaymentVoteListResponseDto.of(
                            vote,
                            historyRepository.findByVote(vote).size()
                            // totalMembers  // <- 프론트가 필요로 한다면 DTO 수정 후 주석 해제!
                    );
                })
                .toList();
    }

    /**
     * 투표 조회
     *
     * @param voteId
     * @param groupId
     * @return
     */
    public PaymentVoteDetailResponseDto getVoteDetail(Long voteId, Long groupId) {
        PaymentVote vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_VOTE));

        List<PaymentVoteHistory> histories = historyRepository.findByVote(vote);

        TransactionHistory transaction = transactionHistoryRepository.findByVoteId(vote.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_TRANSACTION));

        int approveCount = (int) histories.stream()
                .filter(h -> h.getChoice() == VoteChoice.APPROVE).count();
        int rejectCount = (int) histories.stream()
                .filter(h -> h.getChoice() == VoteChoice.REJECT).count();

        List<PaymentVoteDetailResponseDto.VoteHistoryDto> historyDtos = histories.stream()
                .map(h -> new PaymentVoteDetailResponseDto.VoteHistoryDto(
                        h.getUserId(), h.getChoice()))
                .toList();

        return new PaymentVoteDetailResponseDto(
                vote.getId(),
                transaction.getId(),
                vote.getTitle(),
                vote.getDescription(),
                transaction.getAmount(),
                vote.getStatus(),
                vote.getExpiredAt().toString(),
                vote.getTotalMembers(),
                histories.size(),
                approveCount,
                rejectCount,
                historyDtos
        );
    }

    /**
     * 찬성 반대 투표
     *
     * @param voteId
     * @param userId
     * @param request
     */
    @Transactional
    public PaymentVoteResultResponseDto vote(Long voteId, Long userId, PaymentVoteChoiceRequestDto request) {
        PaymentVote vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_VOTE));

        if (vote.getStatus() == VoteStatus.APPROVED) {
            throw new CustomException(ErrorCode.VOTE_ALREADY_APPROVED);
        }
        if (vote.getStatus() == VoteStatus.REJECTED) {
            throw new CustomException(ErrorCode.VOTE_ALREADY_REJECTED);
        }
        if (LocalDateTime.now().isAfter(vote.getExpiredAt())) {
            if (vote.getStatus() == VoteStatus.VOTING) {
                vote.expire(); // DB에 만료 상태 반영
            }
            throw new CustomException(ErrorCode.VOTE_EXPIRED);
        }
        Optional<PaymentVoteHistory> optionalHistory = historyRepository.findByVoteAndUserId(vote, userId);

        if (optionalHistory.isPresent()) {
            PaymentVoteHistory history = optionalHistory.get();
            history.updateChoice(request.choice());
            log.info("[PaymentVote] 유저 재투표 완료: voteId={}, userId={}, choice={}", voteId, userId, request.choice());
        } else {
            PaymentVoteHistory history = PaymentVoteHistory.builder()
                    .vote(vote)
                    .userId(userId)
                    .choice(request.choice())
                    .build();
            historyRepository.save(history);
            log.info("[PaymentVote] 유저 첫 투표 완료: voteId={}, userId={}, choice={}", voteId, userId, request.choice());
        }

        int totalMembers = userServiceClient.getGroupMemberCount(vote.getGroupId()).result();
        int voteCriteria = userServiceClient.getVoteCriteria(vote.getGroupId()).result();
        int approveCount = historyRepository.countByVoteAndChoice(vote, VoteChoice.APPROVE);

        double currentApprovalRate = ((double) approveCount / totalMembers) * 100;

        if (currentApprovalRate >= voteCriteria) {
            vote.approve();
            executePayment(vote);
            return PaymentVoteResultResponseDto.of(
                    vote.getId(),
                    vote.getStatus(),
                    "투표가 가결되어 결제가 성공적으로 승인되었습니다."
            );
        }

        int totalVoted = historyRepository.findByVote(vote).size();
        if (totalVoted >= totalMembers) {
            vote.reject();

            TransactionHistory transaction = transactionHistoryRepository.findByVoteId(vote.getId())
                    .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_TRANSACTION));

            transaction.updateStatus(Status.REJECTED);
            log.info("[PaymentVote] 투표 부결 및 거래내역 취소 완료: voteId={}", vote.getId());
            return PaymentVoteResultResponseDto.of(
                    vote.getId(),
                    vote.getStatus(),
                    "투표가 부결되어 결제가 취소되었습니다."
            );
        }
        return PaymentVoteResultResponseDto.of(
                vote.getId(),
                vote.getStatus(),
                "투표가 정상적으로 반영되었습니다. 다른 멤버의 투표를 기다리고 있습니다."
        );
    }

    private void executePayment(PaymentVote vote) {
        TransactionHistory transaction = transactionHistoryRepository.findByVoteId(vote.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_TRANSACTION));

        Account account = accountRepository.findById(transaction.getAccountId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_ACCOUNT));

        if (account.getAmount().compareTo(transaction.getAmount()) < 0) {
            log.warn("[PaymentVote] 결제 실패 (잔액 부족): voteId={}", vote.getId());
            throw new CustomException(ErrorCode.INSUFFICIENT_BALANCE);
        }

        account.deductAmount(transaction.getAmount());
        transaction.updateStatus(Status.APPROVED);
        transaction.updateBalance(account.getAmount());

        log.info("[PaymentVote] 결제 실행 및 승인 완료: voteId={}, 차감현금={}", vote.getId(), transaction.getAmount());
    }
}
