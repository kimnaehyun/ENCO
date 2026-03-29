package io.ssafy.payment.domain.card.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "card_products")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CardProduct {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String name;

    @Builder.Default
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal baseSpending = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal maxBenefitLimit = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 150)
    private String frontImageUrl;

    @Column(length = 150)
    private String backImageUrl;

    @Builder.Default
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal maxLimit = BigDecimal.ZERO;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isDeleted = false;

    @Builder.Default
    @OneToMany(mappedBy = "cardProduct")
    private List<CardBenefit> cardBenefitList = new ArrayList<>();

    public void softDelete() {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
    }
}
