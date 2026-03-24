package io.ssafy.payment.domain.vote.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity
@Table(name = "votes", indexes = {
        @Index(name = "idx_status_expired", columnList = "status, expired_at")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PaymentVote {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long groupId;

    @Column(length = 50, nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VoteStatus status = VoteStatus.VOTING;

    private LocalDateTime expiredAt;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime deletedAt;

    private Integer voteCriteria;

    private Integer totalMembers;

    public void approve() { this.status = VoteStatus.APPROVED; }
    public void reject()  { this.status = VoteStatus.REJECTED; }
    public void expire()  { this.status = VoteStatus.EXPIRED; }
}