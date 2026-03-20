package io.ssafy.chat.domain.chatroom.document;

import io.ssafy.chat.common.enums.ParticipantRole;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class Participant {

    private Long userId;
    private ParticipantRole role;
    private LocalDateTime joinedAt;
    private String lastReadMessageId;

    @Builder
    public Participant(Long userId, ParticipantRole role, LocalDateTime joinedAt, String lastReadMessageId) {
        this.userId = userId;
        this.role = role;
        this.joinedAt = joinedAt;
        this.lastReadMessageId = lastReadMessageId;
    }

    public void updateLastReadMessageId(String messageId) {
        this.lastReadMessageId = messageId;
    }
}
