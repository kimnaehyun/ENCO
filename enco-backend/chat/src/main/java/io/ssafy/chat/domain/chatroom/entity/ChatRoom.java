package io.ssafy.chat.domain.chatroom.entity;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "chat_rooms")
@Getter
@Builder
public class ChatRoom {
    @Id
    private String id;

    private String groupName;
    private LocalDateTime createdAt;
}