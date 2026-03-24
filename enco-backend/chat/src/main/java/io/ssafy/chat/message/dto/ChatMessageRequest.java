package io.ssafy.chat.message.dto;

import io.ssafy.chat.common.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequest {

    private MessageType messageType;
    private String roomId;
    private Long senderId;
    private String content;
    private Map<String, Object> metadata;
}