package io.ssafy.chat.message.document;

import io.ssafy.chat.common.enums.MessageType;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@NoArgsConstructor
@Document(collection = "chat_message")
public class ChatMessage {

    @Id
    private String id;

    private MessageType messageType;

    private String roomId;

    private Long senderId;

    private String content;

    private Map<String, Object> metadata;

    private Boolean isDeleted;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

    @Builder
    public ChatMessage(MessageType messageType, String roomId, Long senderId,
                       String content, Map<String, Object> metadata) {
        this.messageType = messageType;
        this.roomId = roomId;
        this.senderId = senderId;
        this.content = content;
        this.metadata = metadata;
        this.isDeleted = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void softDelete() {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
