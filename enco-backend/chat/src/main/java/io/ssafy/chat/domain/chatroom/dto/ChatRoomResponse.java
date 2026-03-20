package io.ssafy.chat.domain.chatroom.dto;

import io.ssafy.chat.domain.chatroom.document.ChatRoom;
import io.ssafy.chat.domain.chatroom.document.LastMessage;
import io.ssafy.chat.domain.chatroom.document.Participant;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ChatRoomResponse {

    private String id;
    private Long groupId;
    private List<ParticipantInfo> participants;
    private LastMessageInfo lastMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ChatRoomResponse from(ChatRoom room) {
        return ChatRoomResponse.builder()
                .id(room.getId())
                .groupId(room.getGroupId())
                .participants(room.getParticipants().stream()
                        .map(ParticipantInfo::from)
                        .toList())
                .lastMessage(room.getLastMessage() != null
                        ? LastMessageInfo.from(room.getLastMessage()) : null)
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt())
                .build();
    }

    @Getter
    @Builder
    public static class ParticipantInfo {
        private Long userId;
        private String role;
        private LocalDateTime joinedAt;
        private String lastReadMessageId;

        public static ParticipantInfo from(Participant p) {
            return ParticipantInfo.builder()
                    .userId(p.getUserId())
                    .role(p.getRole().name())
                    .joinedAt(p.getJoinedAt())
                    .lastReadMessageId(p.getLastReadMessageId())
                    .build();
        }
    }

    @Getter
    @Builder
    public static class LastMessageInfo {
        private String messageId;
        private Long senderId;
        private String content;
        private LocalDateTime sentAt;

        public static LastMessageInfo from(LastMessage lm) {
            return LastMessageInfo.builder()
                    .messageId(lm.getMessageId())
                    .senderId(lm.getSenderId())
                    .content(lm.getContent())
                    .sentAt(lm.getSentAt())
                    .build();
        }
    }
}
