package io.ssafy.auth.domain.group.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "due_policies")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class DuePolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_id", nullable = false)
    private Long groupId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    /**
     * 매월 며칠에 회비를 걷을지 (1~28)
     * 정책 미설정
     */
    @Column(name = "day_of_month")
    private Integer dayOfMonth;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DuePolicyStatus status = DuePolicyStatus.ACTIVE;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Builder
    public DuePolicy(Long groupId, BigDecimal amount, LocalDate startDate, Integer dayOfMonth) {
        this.groupId = groupId;
        this.amount = amount;
        this.startDate = startDate;
        this.dayOfMonth = dayOfMonth;
        this.status = DuePolicyStatus.ACTIVE;
        this.isDeleted = false;
    }

    public void pause() {
        this.status = DuePolicyStatus.PAUSED;
    }

    public void activate() {
        this.status = DuePolicyStatus.ACTIVE;
    }

    public void updatePolicy(BigDecimal amount, Integer dayOfMonth) {
        this.amount = amount;
        this.dayOfMonth = dayOfMonth;
    }

    public void delete() {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
        this.status = DuePolicyStatus.PAUSED;
    }
}
