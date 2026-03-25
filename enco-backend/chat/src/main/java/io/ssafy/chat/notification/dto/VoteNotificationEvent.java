package io.ssafy.chat.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
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
