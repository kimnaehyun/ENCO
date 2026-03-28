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
import io.ssafy.payment.domain.vote.dto.request.PointUseRequestDto;
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
import io.ssafy.payment.infra.messaging.producer.KafkaProducerService;
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
    private final KafkaProducerService kafkaProducerService;

    /**
     * 결제 투표 생성 (온라인 결제)
     *
     * @param request
     * @param idempotencyKey
     * @return
     */
    @Transactional
    public PaymentVoteCreateResponseDto createVote(PaymentVoteCreateRequestDto request, String idempotencyKey) {
        log.info("요청 완료 = {}", request.groupId());

        if (idempotencyKey == null || idempotencyKey.trim().isEmpty()) {
            throw new CustomException(ErrorCode.MISSING_IDEMPOTENCY_KEY);
        }

        if (request.amount() == null || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new CustomException(ErrorCode.INVALID_PAYMENT_AMOUNT);
        }

        Optional<TransactionHistory> existing = transactionHistoryRepository.findByIdempotencyKey(idempotencyKey);

        if (existing.isPresent()) {
            log.warn("중복된 멱등키 요청 발생: {}", idempotencyKey);
            
            PaymentVote existingVote = voteRepository.findById(existing.get().getVoteId())
                    .orElseThrow(() -> new CustomException(ErrorCode.DUPLICATE_PAYMENTVOTE)
                    );
            return PaymentVoteCreateResponseDto.from(existingVote);
        }

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
            throw new CustomException(ErrorCode.AUTH_SERVER_ERROR);
        }
        int totalMembers = (totalMembersResult != null) ? totalMembersResult : 0;

        PaymentVote vote = PaymentVote.builder()
                .groupId(request.groupId())
                .title(request.title())
                .description(request.description())
                .totalMembers(totalMembers)
                .status(VoteStatus.VOTING)
                .expiredAt(LocalDateTime.now().plusHours(1))
                .usePoint(request.usePoint() != null ? request.usePoint() : false)
                .build();
        PaymentVote savedVote = voteRepository.save(vote);

        BigDecimal totalAmount = request.amount();

        TransactionHistory pendingTransaction = TransactionHistory.builder()
                .accountId(account.getId())
                .cardId(card.getId())
                .voteId(savedVote.getId())
                .counterpartyBankCode("110")
                .counterpartyBankAccountNumber(request.counterpartyBankAccountNumber())
                .counterpartyBankName(request.counterpartyBankName())
                .counterpartyName(request.counterpartyName())
                .amount(totalAmount)
                .balance(account.getAmount())
                .displayName(request.counterpartyName())
                .type(Type.CARD_PAYMENT)
                .direction(Direction.OUT)
                .status(Status.PENDING)
                .idempotencyKey(idempotencyKey)
                .build();
        transactionHistoryRepository.save(pendingTransaction);

        log.info("[PaymentVote] 투표 생성 완료: 총금액={}, 청구현금={}", totalAmount, totalAmount);

        try {
            kafkaProducerService.sendVoteNotification(
                    savedVote.getGroupId(),
                    savedVote.getId(),
                    savedVote.getTitle(),
                    "새로운 결제 투표가 등록되었습니다. 찬반 투표를 진행해 주세요.",
                    "VOTE_CREATED"
            );
        } catch (Exception e) {
            log.error("[PaymentVote] 투표는 생성됐지만 카프카 알림 전송에 실패했습니다. voteId={}", savedVote.getId(), e);
        }

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
                    );
                })
                .toList();
    }

    /**
     * 투표 상세 조회
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
        PaymentVote vote = voteRepository.findByIdWithPessimisticLock(voteId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_VOTE));

        boolean isMember = userServiceClient.checkGroupMember(vote.getGroupId(), userId).result();

        if (!isMember) {
            throw new CustomException(ErrorCode.NOT_GROUP_MEMBER);
        }

        if (vote.getStatus() == VoteStatus.APPROVED) {
            throw new CustomException(ErrorCode.VOTE_ALREADY_APPROVED);
        }
        if (vote.getStatus() == VoteStatus.REJECTED) {
            throw new CustomException(ErrorCode.VOTE_ALREADY_REJECTED);
        }
        if (LocalDateTime.now().isAfter(vote.getExpiredAt())) {
            if (vote.getStatus() == VoteStatus.VOTING) {
                vote.expire();
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

        int totalMembers = vote.getTotalMembers();
        int voteCriteria = userServiceClient.getVoteCriteria(vote.getGroupId()).result();
        int approveCount = historyRepository.countByVoteAndChoice(vote, VoteChoice.APPROVE);

        double currentApprovalRate = (totalMembers == 0) ? 0.0 : ((double) approveCount / totalMembers) * 100;

        if (currentApprovalRate >= voteCriteria) {
            try {
                executePayment(vote);

                vote.approve();

                kafkaProducerService.sendVoteNotification(
                        vote.getGroupId(),
                        vote.getId(),
                        vote.getTitle(),
                        "투표가 가결되어 결제가 성공적으로 승인되었습니다.",
                        "PAYMENT_APPROVED"
                );

                return PaymentVoteResultResponseDto.of(
                        vote.getId(),
                        vote.getStatus(),
                        "투표가 가결되어 결제가 성공적으로 승인되었습니다."
                );

            } catch (CustomException e) {
                if (e.getErrorCode() == ErrorCode.INSUFFICIENT_BALANCE) {
                    log.warn("[PaymentVote] 결제 실패(잔액부족)로 투표 강제 부결 처리: voteId={}", vote.getId());
                    return processRejection(vote, "잔액 부족으로 결제가 취소(부결)되었습니다.");
                }
                throw e;
            }
        }

        int totalVoted = historyRepository.findByVote(vote).size();
        if (totalVoted >= totalMembers) {
            return processRejection(vote, "투표가 부결되어 결제가 취소되었습니다.");
        }

        return PaymentVoteResultResponseDto.of(
                vote.getId(),
                vote.getStatus(),
                "투표가 정상적으로 반영되었습니다. 다른 멤버의 투표를 기다리고 있습니다."
        );
    }

    /**
     * [추가/수정] 부결 처리를 담당하는 공통 메서드
     */
    private PaymentVoteResultResponseDto processRejection(PaymentVote vote, String message) {
        vote.reject();

        TransactionHistory transaction = transactionHistoryRepository.findByVoteId(vote.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_TRANSACTION));

        Account account = accountRepository.findById(transaction.getAccountId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_ACCOUNT));

        transaction.updateStatus(Status.REJECTED);
        transaction.updateBalance(account.getAmount()); // 부결(취소) 시점의 잔액을 정상적으로 기록

        try {
            kafkaProducerService.sendVoteNotification(
                    vote.getGroupId(),
                    vote.getId(),
                    "결제 투표 부결 안내",
                    message,
                    "VOTE_REJECTED"
            );
        } catch (Exception e) {
            log.error("[PaymentVote] 부결 카프카 알림 전송 실패. voteId={}", vote.getId(), e);
        }

        log.info("[PaymentVote] 투표 부결 및 거래내역 취소 완료: voteId={}", vote.getId());
        return PaymentVoteResultResponseDto.of(vote.getId(), vote.getStatus(), message);
    }

    private void executePayment(PaymentVote vote) {
        TransactionHistory transaction = transactionHistoryRepository.findByVoteId(vote.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_TRANSACTION));

        if (transaction.getStatus() != Status.PENDING) {
            log.warn("[PaymentVote] 이미 처리된 거래입니다. voteId={}", vote.getId());
            return;
        }

        Account account = accountRepository.findById(transaction.getAccountId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_ACCOUNT));

        BigDecimal totalAmount = transaction.getAmount();

        BigDecimal usedPoints = processPointPayment(vote.getGroupId(), vote.getId(), totalAmount, vote.isUsePoint());

        BigDecimal cashToPay = totalAmount.subtract(usedPoints);

        if (cashToPay.compareTo(BigDecimal.ZERO) > 0) {
            if (account.getAmount().compareTo(cashToPay) < 0) {
                log.warn("[PaymentVote] 결제 실패 (잔액 부족): voteId={}", vote.getId());

                rollbackPointPayment(vote.getGroupId(), usedPoints, vote.getId());

                throw new CustomException(ErrorCode.INSUFFICIENT_BALANCE);
            }
            account.deductAmount(cashToPay);
        }

        transaction.updateStatus(Status.APPROVED);
        transaction.updateBalance(account.getAmount());

        log.info("[PaymentVote] 결제 실행 및 승인 완료: voteId={}, 총금액={}, 포인트사용={}, 차감현금={}",
                vote.getId(), totalAmount, usedPoints, cashToPay);
    }

    /**
     * 포인트 조회 및 차감을 전담하는 메서드
     */
    private BigDecimal processPointPayment(Long groupId, Long voteId, BigDecimal totalAmount, boolean usePoint) {
        // 프론트에서 포인트 사용을 안 하겠다고 했으면 0 리턴
        if (!usePoint) {
            return BigDecimal.ZERO;
        }

        try {
            BigDecimal pointBalance = userServiceClient.getGroupPointBalance(groupId).result();

            if (pointBalance == null || pointBalance.compareTo(BigDecimal.ZERO) <= 0) {
                return BigDecimal.ZERO;
            }

            BigDecimal usedPoints = totalAmount.min(pointBalance);

            if (usedPoints.compareTo(BigDecimal.ZERO) > 0) {
                userServiceClient.deductGroupPoint(groupId, new PointUseRequestDto(usedPoints, voteId));
            }

            return usedPoints;

        } catch (Exception e) {
            log.error("[PaymentVote] Auth 서버 포인트 조회/차감 오류: groupId={}, voteId={}", groupId, voteId, e);
            throw new CustomException(ErrorCode.POINT_SYSTEM_ERROR);
        }
    }

    /**
     * 포인트 롤백 (보상 트랜잭션) 메서드
     */
    private void rollbackPointPayment(Long groupId, BigDecimal usedPoints, Long voteId) {
        if (usedPoints.compareTo(BigDecimal.ZERO) > 0) {
            try {
                log.info("[PaymentVote] 결제 실패로 인한 포인트 롤백 요청: groupId={}, amount={}", groupId, usedPoints);

                userServiceClient.refundGroupPoint(groupId, new PointUseRequestDto(usedPoints, voteId));

            } catch (Exception e) {
                log.error("[PaymentVote] 포인트 롤백 실패! 수동 확인 필요: groupId={}, voteId={}", groupId, voteId, e);
            }
        }
    }
}
