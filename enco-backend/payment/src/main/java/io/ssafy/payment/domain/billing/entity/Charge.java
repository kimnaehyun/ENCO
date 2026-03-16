package io.ssafy.payment.domain.billing.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "charges")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Charge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_id", nullable = false)
    private Long groupId;

    @Column(name = "policy_id")
    private Long policyId;

    @Column(name = "expense_id")
    private Long expenseId;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "created_by_user_id", nullable = false)
    private Long createdByUserId;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "charge_type", nullable = false)
    private ChargeType chargeType;  // 청구 타입

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ChargeStatus status;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "receiver_account_id")
    private Long receiverAccountId;

    @Column(name = "receiver_account_number", length = 20)
    private String receiverAccountNumber;

    @Column(name = "receiver_bank_code", length = 50)
    private String receiverBankCode;

    @Column(name = "receiver_bank_name", length = 50)
    private String receiverBankName;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.status == null) {
            this.status = ChargeStatus.OPEN;
        }

        if (this.chargeType == null) {
            this.chargeType = ChargeType.REGULAR_DUE;
        }

        if (this.isDeleted == null) {
            this.isDeleted = false;
        }

        if (this.totalAmount == null) {
            this.totalAmount = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void updateChargeInfo(String displayName, LocalDateTime dueDate, BigDecimal totalAmount) {
        this.displayName = displayName;
        this.dueDate = dueDate;
        this.totalAmount = totalAmount;
    }

    public void updateReceiverAccount(Long receiverAccountId, String receiverAccountNumber,
                                      String receiverBankCode, String receiverBankName) {
        this.receiverAccountId = receiverAccountId;
        this.receiverAccountNumber = receiverAccountNumber;
        this.receiverBankCode = receiverBankCode;
        this.receiverBankName = receiverBankName;
    }

    public void closeCharge() {
        this.status = ChargeStatus.CLOSED;
    }

    public void cancelCharge() {
        this.status = ChargeStatus.CANCELED;
    }

    public void reopenCharge() {
        this.status = ChargeStatus.OPEN;
    }

    public void softDelete() {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
    }
}