package io.ssafy.payment.domain.vote.service;

import io.ssafy.payment.domain.account.entity.Account;
import io.ssafy.payment.domain.account.repository.AccountRepository;
import io.ssafy.payment.domain.card.entity.Card;
import io.ssafy.payment.domain.card.repository.CardRepository;
import io.ssafy.payment.domain.transaction.entity.Status;
import io.ssafy.payment.domain.transaction.entity.TransactionHistory;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentVoteServiceTest {

    @InjectMocks
    private PaymentVoteService paymentVoteService;

    @Mock private PaymentVoteRepository voteRepository;
    @Mock private PaymentVoteHistoryRepository historyRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private CardRepository cardRepository;
    @Mock private TransactionHistoryRepository transactionHistoryRepository;
    @Mock private UserServiceClient userServiceClient;
    @Mock private PasswordEncoder passwordEncoder;

    // --- Mock 객체 생성 헬퍼 ---
    private Account createMockAccount(Long id, BigDecimal amount) {
        Account account = Account.builder().password("encoded1234").build();
        ReflectionTestUtils.setField(account, "id", id);
        ReflectionTestUtils.setField(account, "amount", amount);
        return account;
    }

    private PaymentVote createMockVote(Long id, VoteStatus status, LocalDateTime expiredAt, int totalMembers) {
        PaymentVote vote = PaymentVote.builder()
                .groupId(1L).title("테스트 결제").totalMembers(totalMembers)
                .status(status).expiredAt(expiredAt).build();
        ReflectionTestUtils.setField(vote, "id", id);
        return vote;
    }

    private TransactionHistory createMockTransaction(Long voteId, Status status, BigDecimal amount) {
        TransactionHistory tx = TransactionHistory.builder()
                .voteId(voteId).amount(amount).status(status).build();
        ReflectionTestUtils.setField(tx, "id", 100L);
        return tx;
    }

    // Auth 서버 응답 모킹용 익명 클래스 혹은 인터페이스 모방
    private <T> Object mockClientResponse(T resultData) {
        // UserServiceClient의 반환 타입 구조에 맞게 수정 필요 (예: CommonResponse)
        return new Object() {
            public T result() { return resultData; }
        };
    }

    @Nested
    @DisplayName("createVote() 테스트")
    class CreateVoteTest {

        private PaymentVoteCreateRequestDto requestDto;
        private final String idempotencyKey = "key-123";

        @BeforeEach
        void setUp() {
            requestDto = new PaymentVoteCreateRequestDto(
                    1L, 1L, "1234", "회식비 결제", "11-111",
                   "1111" ,"제목", "설명", BigDecimal.valueOf(50000)
            );
        }

        @Test
        @DisplayName("성공: 모든 조건이 맞을 때 투표와 거래내역이 생성된다")
        void success() throws Exception {
            // Given
            Account account = createMockAccount(1L, BigDecimal.valueOf(100000));
            Card card = Card.builder().build();
            ReflectionTestUtils.setField(card, "id", 1L);
            PaymentVote savedVote = createMockVote(10L, VoteStatus.VOTING, LocalDateTime.now().plusHours(1), 5);

            given(transactionHistoryRepository.findByIdempotencyKey(idempotencyKey)).willReturn(Optional.empty());
            given(accountRepository.findByGroupId(requestDto.groupId())).willReturn(Optional.of(account));
            given(passwordEncoder.matches(requestDto.password(), account.getPassword())).willReturn(true);
            given(cardRepository.findById(requestDto.cardId())).willReturn(Optional.of(card));

            // Note: userServiceClient 응답 모킹 (실제 반환 타입에 맞게 캐스팅 필요)
            var responseMock = mock(io.ssafy.payment.global.common.response.CommonResponse.class); // 패키지명에 맞게 수정
            given(responseMock.result()).willReturn(5);
            given(userServiceClient.getGroupMemberCount(requestDto.groupId())).willReturn(responseMock);

            given(voteRepository.save(any(PaymentVote.class))).willReturn(savedVote);

            // When
            PaymentVoteCreateResponseDto response = paymentVoteService.createVote(requestDto, idempotencyKey);

            // Then
            assertThat(response).isNotNull();
            verify(voteRepository, times(1)).save(any(PaymentVote.class));
            verify(transactionHistoryRepository, times(1)).save(any(TransactionHistory.class));
        }

        @Test
        @DisplayName("실패: 멱등성 키가 누락된 경우 예외 발생")
        void fail_missingIdempotencyKey() {
            // When & Then
            CustomException ex = assertThrows(CustomException.class, () ->
                    paymentVoteService.createVote(requestDto, " "));
            assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.MISSING_IDEMPOTENCY_KEY);
        }

        @Test
        @DisplayName("실패: 결제 금액이 0원 이하인 경우 예외 발생")
        void fail_invalidAmount() {
            // Given
            PaymentVoteCreateRequestDto badRequest = new PaymentVoteCreateRequestDto(
                    1L, 1L, "1234", "회식비 결제", "11-111",
                    "1111" ,"제목", "설명", BigDecimal.ZERO
            );

            // When & Then
            CustomException ex = assertThrows(CustomException.class, () ->
                    paymentVoteService.createVote(badRequest, idempotencyKey));
            assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.INVALID_PAYMENT_AMOUNT);
        }

        @Test
        @DisplayName("성공: 이미 처리된 멱등성 키일 경우 기존 투표 반환")
        void success_duplicateIdempotencyKey() {
            // Given
            TransactionHistory existingTx = createMockTransaction(10L, Status.PENDING, BigDecimal.valueOf(50000));
            PaymentVote existingVote = createMockVote(10L, VoteStatus.VOTING, LocalDateTime.now().plusHours(1), 5);

            given(transactionHistoryRepository.findByIdempotencyKey(idempotencyKey)).willReturn(Optional.of(existingTx));
            given(voteRepository.findById(existingTx.getVoteId())).willReturn(Optional.of(existingVote));

            // When
            PaymentVoteCreateResponseDto response = paymentVoteService.createVote(requestDto, idempotencyKey);

            // Then
            assertThat(response).isNotNull();
            verify(voteRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("vote() 및 executePayment() 테스트")
    class VoteTest {

        private final Long voteId = 1L;
        private final Long userId = 2L;
        private PaymentVoteChoiceRequestDto approveRequest;
        private PaymentVote vote;

        @BeforeEach
        void setUp() {
            approveRequest = new PaymentVoteChoiceRequestDto(VoteChoice.APPROVE);
            vote = createMockVote(voteId, VoteStatus.VOTING, LocalDateTime.now().plusHours(1), 3);
        }

        @Test
        @DisplayName("성공: 유저의 첫 투표가 정상 반영됨 (가결 조건 미달)")
        void success_firstVote_notApprovedYet() {
            // Given
            given(voteRepository.findByIdWithPessimisticLock(voteId)).willReturn(Optional.of(vote));
            given(historyRepository.findByVoteAndUserId(vote, userId)).willReturn(Optional.empty());

            var criteriaMock = mock(io.ssafy.payment.global.common.response.CommonResponse.class);
            given(criteriaMock.result()).willReturn(100); // 100% 가결 조건
            given(userServiceClient.getVoteCriteria(vote.getGroupId())).willReturn(criteriaMock);

            given(historyRepository.countByVoteAndChoice(vote, VoteChoice.APPROVE)).willReturn(1);
            given(historyRepository.findByVote(vote)).willReturn(List.of(PaymentVoteHistory.builder().build()));

            // When
            PaymentVoteResultResponseDto response = paymentVoteService.vote(voteId, userId, approveRequest);

            // Then
            assertThat(response.status()).isEqualTo(VoteStatus.VOTING);
            verify(historyRepository, times(1)).save(any(PaymentVoteHistory.class));
            verify(transactionHistoryRepository, never()).findByVoteId(any()); // 결제 실행 안 됨
        }

        @Test
        @DisplayName("성공: 투표 가결 조건을 만족하여 결제가 실행되고 상태가 APPROVED로 변경됨")
        void success_voteApproved_and_paymentExecuted() {
            // Given
            TransactionHistory tx = createMockTransaction(voteId, Status.PENDING, BigDecimal.valueOf(10000));
            Account account = createMockAccount(tx.getAccountId(), BigDecimal.valueOf(50000)); // 잔액 충분

            given(voteRepository.findByIdWithPessimisticLock(voteId)).willReturn(Optional.of(vote));
            given(historyRepository.findByVoteAndUserId(vote, userId)).willReturn(Optional.empty());

            var criteriaMock = mock(io.ssafy.payment.global.common.response.CommonResponse.class);
            given(criteriaMock.result()).willReturn(66); // 66% 이상 가결
            given(userServiceClient.getVoteCriteria(vote.getGroupId())).willReturn(criteriaMock);

            given(historyRepository.countByVoteAndChoice(vote, VoteChoice.APPROVE)).willReturn(2); // 2/3 = 66.6% -> 가결

            // executePayment 내부 Mocking
            given(transactionHistoryRepository.findByVoteId(voteId)).willReturn(Optional.of(tx));
            given(accountRepository.findById(tx.getAccountId())).willReturn(Optional.of(account));

            // When
            PaymentVoteResultResponseDto response = paymentVoteService.vote(voteId, userId, approveRequest);

            // Then
            assertThat(vote.getStatus()).isEqualTo(VoteStatus.APPROVED);
            assertThat(tx.getStatus()).isEqualTo(Status.APPROVED);
            assertThat(account.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(40000)); // 5만 - 1만
        }

        @Test
        @DisplayName("실패: 투표는 가결되었으나 계좌 잔액 부족으로 INSUFFICIENT_BALANCE 예외 발생")
        void fail_insufficientBalance_onPayment() {
            // Given
            TransactionHistory tx = createMockTransaction(voteId, Status.PENDING, BigDecimal.valueOf(100000)); // 10만원 결제 시도
            Account account = createMockAccount(tx.getAccountId(), BigDecimal.valueOf(50000)); // 잔액 5만원

            given(voteRepository.findByIdWithPessimisticLock(voteId)).willReturn(Optional.of(vote));
            given(historyRepository.findByVoteAndUserId(vote, userId)).willReturn(Optional.empty());

            var criteriaMock = mock(io.ssafy.payment.global.common.response.CommonResponse.class);
            given(criteriaMock.result()).willReturn(50);
            given(userServiceClient.getVoteCriteria(vote.getGroupId())).willReturn(criteriaMock);
            given(historyRepository.countByVoteAndChoice(vote, VoteChoice.APPROVE)).willReturn(2); // 가결 조건 만족

            given(transactionHistoryRepository.findByVoteId(voteId)).willReturn(Optional.of(tx));
            given(accountRepository.findById(tx.getAccountId())).willReturn(Optional.of(account));

            // When & Then
            CustomException ex = assertThrows(CustomException.class, () ->
                    paymentVoteService.vote(voteId, userId, approveRequest));
            assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.INSUFFICIENT_BALANCE);
        }

        @Test
        @DisplayName("실패: 만료된 투표에 접근 시 예외 발생 및 만료 상태로 변경")
        void fail_voteExpired() {
            // Given
            PaymentVote expiredVote = createMockVote(voteId, VoteStatus.VOTING, LocalDateTime.now().minusMinutes(5), 3);
            given(voteRepository.findByIdWithPessimisticLock(voteId)).willReturn(Optional.of(expiredVote));

            // When & Then
            CustomException ex = assertThrows(CustomException.class, () ->
                    paymentVoteService.vote(voteId, userId, approveRequest));

            assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.VOTE_EXPIRED);
            assertThat(expiredVote.getStatus()).isEqualTo(VoteStatus.EXPIRED); // 내부에서 expire() 호출 확인
        }
    }
}