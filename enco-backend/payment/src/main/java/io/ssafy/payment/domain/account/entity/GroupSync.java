package io.ssafy.payment.domain.account.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "group_sync")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupSync {

    @Id
    private Long id; // auth 서비스의 group id와 동일

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private boolean isDeleted = false;

    @Builder
    public GroupSync(Long id, String name) {
        this.id = id;
        this.name = name;
        this.isDeleted = false;
    }

    public void markDeleted() {
        this.isDeleted = true;
    }
}
