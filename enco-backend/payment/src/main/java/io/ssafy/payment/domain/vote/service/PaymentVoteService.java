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
    public PaymentVoteCreateResponseDto createVote(PaymentVoteCreateRequestDto request) {
        Account account = accountRepository.findByGroupId(request.groupId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_ACCOUNT));

        if (!passwordEncoder.matches(request.password(), account.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }
        log.info("계좌 객체 생성 완료");

        Card card = cardRepository.findById(request.cardId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_CARD));
        log.info("카드 객체 생성 완료");

        PaymentVote vote = PaymentVote.builder()
                .groupId(request.groupId())
                .title(request.title())
                .description(request.description())
                .expiredAt(LocalDateTime.now().plusHours(1))
                .build();

        PaymentVote savedVote = voteRepository.save(vote);
        log.info("결제 투표 생성 완료");

        TransactionHistory pendingTransaction = TransactionHistory.builder()
                .accountId(account.getId())
                .cardId(card.getId())
                .voteId(savedVote.getId())
                .counterpartyBankAccountNumber(request.counterpartyBankAccountNumber()) // 상대 계좌번호
                .counterpartyBankName(request.counterpartyBankName()) //상대 은행명
                .counterpartyName(request.counterpartyName()) //상대방명
                .amount(request.amount())
                .displayName(request.counterpartyName())
                .type(Type.CARD_PAYMENT)
                .direction(Direction.OUT)
                .status(Status.PENDING)
                .build();
        transactionHistoryRepository.save(pendingTransaction);
        log.info("거래내역 생성 완료");

        return PaymentVoteCreateResponseDto.from(savedVote);
    }

    public List<PaymentVoteListResponseDto> getVoteList(Long groupId) {
        return voteRepository.findByGroupIdAndStatusAndExpiredAtAfter(groupId, VoteStatus.VOTING, LocalDateTime.now())
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

        TransactionHistory transaction = transactionHistoryRepository.findByVoteId(vote.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_TRANSACTION));

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
                transaction.getId(),
                vote.getTitle(),
                vote.getDescription(),
                transaction.getAmount(),
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
            return;
        }

        int totalVoted = historyRepository.findByVote(vote).size();
        if (totalVoted >= totalMembers) {
            vote.reject();

            TransactionHistory transaction = transactionHistoryRepository.findByVoteId(vote.getId())
                    .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_TRANSACTION));

            transaction.updateStatus(Status.REJECTED);

            log.info("[PaymentVote] 투표 부결 및 거래내역 취소 완료: voteId={}", vote.getId());
        }
    }

    private void executePayment(PaymentVote vote) {
        TransactionHistory transaction = transactionHistoryRepository.findByVoteId(vote.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_TRANSACTION));

        Account account = accountRepository.findById(transaction.getAccountId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_ACCOUNT));

        if (account.getAmount().compareTo(transaction.getAmount()) < 0) {
            log.warn("[PaymentVote] 결제 실패 (잔액 부족): voteId={}", vote.getId());

            transaction.updateStatus(Status.REJECTED);
            vote.reject();
            return;
        }

        account.deductAmount(transaction.getAmount()); // 실제 돈 차감
        transaction.updateStatus(Status.APPROVED); // 거래내역 상태 업데이트
        transaction.updateBalance(account.getAmount()); // 거래내역 잔액 업데이트

        log.info("[PaymentVote] 결제 실행 및 승인 완료: voteId={}, 차감금액={}", vote.getId(), transaction.getAmount());
    }
    
}