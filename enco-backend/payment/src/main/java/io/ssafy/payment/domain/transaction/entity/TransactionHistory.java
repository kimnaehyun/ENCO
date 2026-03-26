package io.ssafy.payment.domain.transaction.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaction_histories")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TransactionHistory {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long accountId;

    private Long cardId;

    private Long voteId;

    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    @Builder.Default
    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'ETC'")
    private String category = "ETC";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Direction direction;

    private String memo;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal balance;

    @Column(columnDefinition = "TEXT")
    private String receiptUrl;

    @Column(columnDefinition = "TEXT")
    private String receiptContent;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isDeleted = false;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(length = 10)
    private String counterpartyBankCode;

    @Column(length = 50)
    private String counterpartyBankName;

    @Column(length = 50)
    private String counterpartyBankAccountNumber;

    @Column(length = 50)
    private String counterpartyName;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    @Column(unique = true, length = 64)
    private String idempotencyKey;

    public void updateStatus(Status newStatus) {
        this.status = newStatus;
    }

    public void updateBalance(BigDecimal currentBalance) {
        this.balance = currentBalance;
    }
}