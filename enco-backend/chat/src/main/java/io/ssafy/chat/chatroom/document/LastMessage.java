package io.ssafy.chat.chatroom.document;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class LastMessage {

    private String messageId;
    private Long senderId;
    private String content;
    private LocalDateTime sentAt;

    @Builder
    public LastMessage(String messageId, Long senderId, String content, LocalDateTime sentAt) {
        this.messageId = messageId;
        this.senderId = senderId;
        this.content = content;
        this.sentAt = sentAt;
    }
}
