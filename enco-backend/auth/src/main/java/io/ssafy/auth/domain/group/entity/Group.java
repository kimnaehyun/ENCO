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
@Table(name = "groups")
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

    @Column(nullable = false, length = 1000)
    private String introduction;

    @Column(nullable = false)
    private Integer voteCriteria = 0;

    @Column(nullable = false, length = 1000)
    private String groundRule;

    @Column(nullable = false)
    private BigDecimal point = BigDecimal.ZERO;

    @Column(nullable = false)
    private Boolean isDeleted = false;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "group")
    private List<GroupType> groupTypeList = new ArrayList<>();

    @OneToMany(mappedBy = "group")
    private List<GroupUser> groupUserList = new ArrayList<>();
}
