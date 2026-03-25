package io.ssafy.auth.domain.point.entity;


import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "point_histories")
@Getter
public class PointHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long groupId;

    private Long eventId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal balance;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Direction direction;

    @Column(length = 50)
    private String description;

    @Column(nullable = false)
    private Long referenceId;

    private LocalDateTime createdAt;

    @Builder
    public PointHistory(Long groupId, Long eventId, BigDecimal amount, BigDecimal balance, Direction direction, String description, Long referenceId) {
        this.groupId = groupId;
        this.eventId = eventId;
        this.amount = amount;
        this.balance = balance;
        this.direction = direction;
        this.description = description;
        this.referenceId = referenceId;
        this.createdAt = LocalDateTime.now();
    }

    public PointHistory() {

    }
}

