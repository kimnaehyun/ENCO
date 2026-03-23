package io.ssafy.payment.domain.vote.service;

import io.ssafy.payment.domain.transaction.entity.Status;
import io.ssafy.payment.domain.transaction.entity.TransactionHistory;
import io.ssafy.payment.domain.transaction.repository.TransactionHistoryRepository;
import io.ssafy.payment.domain.vote.entity.PaymentVote;
import io.ssafy.payment.domain.vote.entity.VoteStatus;
import io.ssafy.payment.domain.vote.repository.PaymentVoteRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentVoteScheduledService {
    private final PaymentVoteRepository voteRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;

    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void closeExpiredVotes() {
        LocalDateTime now = LocalDateTime.now();

        List<PaymentVote> expiredVotes = voteRepository.findByStatusAndExpiredAtBefore(VoteStatus.VOTING, now);

        if (expiredVotes.isEmpty()) {
            return;
        }

        for (PaymentVote vote : expiredVotes) {
            vote.expire();

            transactionHistoryRepository.findByVoteId(vote.getId()).ifPresent(transaction -> {
                transaction.updateStatus(Status.CANCELED);
            });

            log.info("[스케줄러] 시간 초과된 투표 자동 취소 처리 완료: voteId={}", vote.getId());
        }
    }
}
