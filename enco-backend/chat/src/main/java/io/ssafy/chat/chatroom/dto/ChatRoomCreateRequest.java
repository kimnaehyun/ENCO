package io.ssafy.chat.chatroom.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class ChatRoomCreateRequest {

    private Long groupId;
    private List<Long> participantIds;
}
