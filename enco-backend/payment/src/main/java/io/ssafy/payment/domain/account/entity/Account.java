package io.ssafy.payment.domain.account.entity;

import io.ssafy.payment.domain.card.entity.Card;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity(name = "accounts")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@EntityListeners(AuditingEntityListener.class)
public class Account {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long groupId;

    @Column(nullable = false, length = 100)
    private String accountNumber;

    @Column(nullable = false)
    private String password;

    @Builder.Default
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

    @Column(nullable = false)
    private LocalDateTime expirationAt;

    private LocalDateTime lastTransactionAt;

    @Builder.Default
    @Column(nullable = false, length = 8)
    private String currency = "KRW";

    @Builder.Default
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AccountType accountType = AccountType.GROUP;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @OneToMany(mappedBy = "account")
    @Builder.Default
    private List<Card> cardList = new ArrayList<>();

    public void deductAmount(BigDecimal requestAmount) {
        if (this.amount.compareTo(requestAmount) < 0) {
            throw new IllegalArgumentException("계좌 잔액이 부족합니다.");
        }

        this.amount = this.amount.subtract(requestAmount);

        this.lastTransactionAt = LocalDateTime.now();
    }
}