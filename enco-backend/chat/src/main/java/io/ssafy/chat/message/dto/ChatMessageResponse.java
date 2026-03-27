package io.ssafy.chat.message.dto;

import io.ssafy.chat.common.enums.MessageType;
import io.ssafy.chat.message.document.ChatMessage;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Builder
public class ChatMessageResponse {

    private String id;
    private MessageType messageType;
    private String roomId;
    private Long senderId;
    private String senderName;
    private Integer senderProfileImage;
    private String content;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;

    public static ChatMessageResponse from(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .messageType(message.getMessageType())
                .roomId(message.getRoomId())
                .senderId(message.getSenderId())
                .content(message.getContent())
                .metadata(message.getMetadata())
                .createdAt(message.getCreatedAt())
                .build();
    }

    public void enrichSenderInfo(String senderName, Integer senderProfileImage) {
        this.senderName = senderName;
        this.senderProfileImage = senderProfileImage;
    }
}
