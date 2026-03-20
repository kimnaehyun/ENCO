package io.ssafy.chat.domain.chatroom.document;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
@Document(collection = "chat_room")
public class ChatRoom {

    @Id
    private String id;

    private String groupName;

    private Long groupId;

    private List<Participant> participants = new ArrayList<>();

    private LastMessage lastMessage;

    private Boolean isDeleted;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

    @Builder
    public ChatRoom(String groupName, Long groupId, List<Participant> participants) {
        this.groupId = groupId;
        this.groupName = groupName;
        this.participants = participants != null ? participants : new ArrayList<>();
        this.isDeleted = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void updateLastMessage(LastMessage lastMessage) {
        this.lastMessage = lastMessage;
        this.updatedAt = LocalDateTime.now();
    }

    public void addParticipant(Participant participant) {
        this.participants.add(participant);
        this.updatedAt = LocalDateTime.now();
    }

    public void removeParticipant(Long userId) {
        this.participants.removeIf(p -> p.getUserId().equals(userId));
        this.updatedAt = LocalDateTime.now();
    }

    public void softDelete() {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
