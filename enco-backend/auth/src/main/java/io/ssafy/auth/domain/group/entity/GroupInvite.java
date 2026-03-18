package io.ssafy.auth.domain.group.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_invites")
@Getter
@EntityListeners(AuditingEntityListener.class)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupInvite {

    @Id
    @Column(length = 36)
    private String token;

    @Column(nullable = false)
    private Long groupId;

    @Column(nullable = false)
    private Long createdByUserId;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @CreatedDate
    private LocalDateTime createdAt;
}
