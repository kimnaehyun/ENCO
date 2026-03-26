package io.ssafy.payment.infra.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoteNotificationEvent {
    private Long groupId;
    private Long voteId;
    private String title;
    private String message;
    private String type;
    private long timestamp;
}