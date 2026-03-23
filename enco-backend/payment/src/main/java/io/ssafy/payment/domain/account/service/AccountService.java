package io.ssafy.payment.domain.account.service;

import io.ssafy.payment.domain.account.dto.request.CardIssueRequestDto;
import io.ssafy.payment.domain.account.dto.request.PaymentCreateRequestDto;
import io.ssafy.payment.domain.account.dto.response.CardIssueResponseDto;
import io.ssafy.payment.domain.account.dto.response.GroupAccountCardResponseDto;
import io.ssafy.payment.domain.account.dto.response.PaymentCreateResponseDto;
import io.ssafy.payment.domain.account.entity.Account;
import io.ssafy.payment.domain.account.entity.Product;
import io.ssafy.payment.domain.account.repository.AccountRepository;
import io.ssafy.payment.domain.account.repository.ProductRepository;
import io.ssafy.payment.domain.card.entity.Card;
import io.ssafy.payment.domain.card.entity.CardType;
import io.ssafy.payment.domain.card.repository.CardProductRepository;
import io.ssafy.payment.domain.card.repository.CardRepository;
import io.ssafy.payment.domain.transaction.entity.TransactionHistory;
import io.ssafy.payment.domain.transaction.entity.Type;
import io.ssafy.payment.domain.transaction.entity.Direction;
import io.ssafy.payment.domain.transaction.repository.TransactionHistoryRepository;
import io.ssafy.payment.global.common.error.CustomException;
import io.ssafy.payment.global.common.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService {

    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;
    private final CardProductRepository cardProductRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final ProductRepository productRepository;

    @Transactional
    public PaymentCreateResponseDto createAccountAndCard(PaymentCreateRequestDto request) {
        try {
            Product baseProduct = productRepository.findById(1L)
                    .orElseThrow(() -> new CustomException(ErrorCode.BAD_REQUEST));

            String newAccountNumber = "3333-01-" + UUID.randomUUID().toString().substring(0, 6);

            Account account = Account.builder()
                    .groupId(request.groupId())
                    .accountNumber(newAccountNumber)
                    .password(request.password())
                    .expirationAt(LocalDateTime.now().plusYears(5))
                    .amount(BigDecimal.ZERO)
                    .product(baseProduct)
                    .build();
            Account savedAccount = accountRepository.save(account);
            log.info("[AccountService] Account created: accountId={}, groupId={}", savedAccount.getId(), request.groupId());

            TransactionHistory history = TransactionHistory.builder()
                    .accountId(savedAccount.getId())
                    .amount(BigDecimal.ZERO)
                    .balance(BigDecimal.ZERO)
                    .type(Type.TRANSFER)
                    .direction(Direction.IN)
                    .category("ACCOUNT_OPEN")
                    .memo("모임 통장 개설")
                    .build();
            transactionHistoryRepository.save(history);

            var cardProduct = cardProductRepository.findById(request.cardProductId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카드 상품입니다."));

            Card card = Card.builder()
                    .account(savedAccount)
                    .cardNumber("5332-" + UUID.randomUUID().toString().substring(0, 10))
                    .cvc("123")
                    .type(CardType.CHECK)
                    .expirationAt(LocalDateTime.now().plusYears(5))
                    .isBasic(true)
                    .cardProduct(cardProduct)
                    .build();
            Card savedCard = cardRepository.save(card);
            log.info("[AccountService] Card created: cardId={}, accountId={}", savedCard.getId(), savedAccount.getId());

            return PaymentCreateResponseDto.of(savedAccount.getId(), savedAccount.getAccountNumber(), savedCard.getId());
        } catch (Exception e) {
            log.error("[AccountService] Error creating account and card: {}", e.getMessage(), e);
            throw new RuntimeException("계좌 및 카드 생성 실패: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<GroupAccountCardResponseDto> getAccountsByIds(List<Long> accountIds) {
        return accountRepository.findByIdInWithBasicCard(accountIds)
                .stream()
                .map(GroupAccountCardResponseDto::from)
                .toList();
    }

    @Transactional
    public CardIssueResponseDto issueAdditionalCard(CardIssueRequestDto request) {
        Account account = accountRepository.findById(request.accountId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_ACCOUNT));

        var cardProduct = cardProductRepository.findById(request.cardProductId())
                .orElseThrow(() -> new CustomException(ErrorCode.BAD_REQUEST));

        Card card = Card.builder()
                .account(account)
                .cardNumber("5332-" + UUID.randomUUID().toString().substring(0, 10))
                .cvc("123")
                .type(CardType.CHECK)
                .expirationAt(LocalDateTime.now().plusYears(5))
                .isBasic(false)
                .cardProduct(cardProduct)
                .build();

        Card savedCard = cardRepository.save(card);
        log.info("[AccountService] Additional card issued: cardId={}, accountId={}",
                savedCard.getId(), account.getId());

        return CardIssueResponseDto.from(savedCard);
    }
}