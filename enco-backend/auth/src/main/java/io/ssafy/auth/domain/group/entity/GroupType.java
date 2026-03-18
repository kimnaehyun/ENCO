package io.ssafy.auth.domain.group.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "group_types")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupType {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id")
    private Type type;
}
