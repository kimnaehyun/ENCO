package io.ssafy.payment.domain.billing.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "charge_targets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ChargeTarget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 청구 ID */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "charge_id", nullable = false)
    private Charge charge;

    /** 대상 유저 ID */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /** 청구 금액 */
    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    /** 남은 금액 */
    @Column(name = "remaining_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal remainingAmount;

    /** 상태 */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ChargeTargetStatus status;

    /** 삭제 여부 */
    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    /** 생성 시간 */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /** 수정 시간 */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /** 삭제 시간 */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;


    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.status == null) {
            this.status = ChargeTargetStatus.UNPAID;
        }

        if (this.remainingAmount == null) {
            this.remainingAmount = amount;
        }

        if (this.isDeleted == null) {
            this.isDeleted = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 납부 처리
     */
    public void pay(BigDecimal payAmount) {
        this.remainingAmount = this.remainingAmount.subtract(payAmount);

        if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            this.remainingAmount = BigDecimal.ZERO;
            this.status = ChargeTargetStatus.PAID;
        } else {
            this.status = ChargeTargetStatus.PARTIAL;
        }
    }

    /**
     * 삭제 처리
     */
    public void softDelete() {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
    }
}