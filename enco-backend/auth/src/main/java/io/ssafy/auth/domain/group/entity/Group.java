package io.ssafy.auth.domain.group.entity;

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

@Entity
@Table(name = "`groups`")
@EntityListeners(AuditingEntityListener.class)
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class Group {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Long ownerUserId;

    @Column(length = 1000)
    private String introduction;

    @Builder.Default
    private Integer voteCriteria = 0;

    @Column(length = 1000)
    private String groundRule;

    @Builder.Default
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal point = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isDeleted = false;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private Long accountId;

    @Builder.Default
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupType> groupTypeList = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true )
    private List<GroupUser> groupUserList = new ArrayList<>();

    public void updateSettings(String name, String introduction, String groundRule, Integer voteCriteria) {
        if (name != null) this.name = name;
        if (introduction != null) this.introduction = introduction;
        if (groundRule != null) this.groundRule = groundRule;
        if (voteCriteria != null) this.voteCriteria = voteCriteria;
    }

    public void updateAccountId(Long accountId) {
        this.accountId = accountId;
    }
}
