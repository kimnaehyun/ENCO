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

import java.time.LocalDateTime;
import java.util.List;

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
    public PaymentVoteCreateResponseDto createVote(Long userId, PaymentVoteCreateRequestDto request) {
        Account account = accountRepository.findByGroupId(request.groupId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_ACCOUNT));

        if (!passwordEncoder.matches(request.password(), account.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }

        Card card = cardRepository.findById(request.cardId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_CARD));

        PaymentVote vote = PaymentVote.builder()
                .transactionId(request.transactionId())
                .groupId(request.groupId())
                .card(card)
                .account(account)
                .title(request.title())
                .amount(request.amount())
                .expiredAt(LocalDateTime.now().plusHours(1))
                .build();

        PaymentVote savedVote = voteRepository.save(vote);

        TransactionHistory pendingTransaction = TransactionHistory.builder()
                .accountId(account.getId())
                .cardId(card.getId())
                .voteId(savedVote.getId())
                .amount(request.amount())
                .displayName(request.title())
                .type(Type.CARD_PAYMENT)
                .direction(Direction.OUT)
                .status(Status.PENDING)
                .build();
        transactionHistoryRepository.save(pendingTransaction);

        return PaymentVoteCreateResponseDto.from(savedVote);
    }

    public List<PaymentVoteListResponseDto> getVoteList(Long groupId) {
        return voteRepository.findByGroupIdAndStatus(groupId, VoteStatus.VOTING)
                .stream()
                .map(vote -> PaymentVoteListResponseDto.of(
                        vote,
                        historyRepository.findByVote(vote).size()
                ))
                .toList();
    }

    public PaymentVoteDetailResponseDto getVoteDetail(Long voteId, Long groupId) {
        PaymentVote vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_VOTE));

        List<PaymentVoteHistory> histories = historyRepository.findByVote(vote);

        int totalMembers = userServiceClient.getGroupMemberCount(groupId).result();

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
                vote.getTransactionId(),
                vote.getTitle(),
                vote.getAmount(),
                vote.getStatus(),
                vote.getExpiredAt().toString(),
                totalMembers,
                histories.size(),
                approveCount,
                rejectCount,
                historyDtos
        );
    }

    // 4. 찬성/반대 투표
    @Transactional
    public void vote(Long voteId, Long userId, PaymentVoteChoiceRequestDto request) {
        PaymentVote vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_VOTE));

        if (vote.getStatus() != VoteStatus.VOTING) {
            throw new CustomException(ErrorCode.VOTE_ALREADY_CLOSED);
        }
        if (LocalDateTime.now().isAfter(vote.getExpiredAt())) {
            vote.expire();
            throw new CustomException(ErrorCode.VOTE_EXPIRED);
        }
        if (historyRepository.existsByVoteAndUserId(vote, userId)) {
            throw new CustomException(ErrorCode.ALREADY_VOTED);
        }

        PaymentVoteHistory history = PaymentVoteHistory.builder()
                .vote(vote)
                .userId(userId)
                .choice(request.choice())
                .build();
        historyRepository.save(history);

        int totalMembers = userServiceClient.getGroupMemberCount(vote.getGroupId()).result();
        int totalVoted = historyRepository.findByVote(vote).size();

        if (totalVoted >= totalMembers) {
            int voteCriteria = userServiceClient.getVoteCriteria(vote.getGroupId()).result();
            int approveCount = historyRepository.countByVoteAndChoice(vote, VoteChoice.APPROVE);

            double currentApprovalRate = ((double) approveCount / totalMembers) * 100;

            if (currentApprovalRate >= voteCriteria) {
                vote.approve();
                executePayment(vote);
            } else {
                vote.reject();
                updateTransactionStatus(vote, Status.REJECTED); // 거래내역도 REJECTED 처리
            }
        }
    }

    private void executePayment(PaymentVote vote) {
        Account account = vote.getAccount();

        if (account.getAmount().compareTo(vote.getAmount()) < 0) {
            log.warn("[PaymentVote] 결제 실패 (잔액 부족): voteId={}", vote.getId());
            updateTransactionStatus(vote, Status.REJECTED);
            return;
        }

         account.deductAmount(account.getAmount().subtract(vote.getAmount()));

        updateTransactionStatus(vote, Status.APPROVED);

        log.info("[PaymentVote] 결제 실행 및 승인 완료: voteId={}, 차감금액={}", vote.getId(), vote.getAmount());
    }

    private void updateTransactionStatus(PaymentVote vote, Status newStatus) {
        TransactionHistory transaction = transactionHistoryRepository.findByVoteId(vote.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_TRANSACTION));

        log.info("[PaymentVote] 거래내역 상태 변경: voteId={}, {} -> {}", vote.getId(), transaction.getStatus(), newStatus);
    }
}