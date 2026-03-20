package io.ssafy.chat.domain.chatroom.service;

import io.ssafy.chat.domain.chatroom.document.ChatRoom;
import io.ssafy.chat.domain.chatroom.dto.response.ChatRoomCreateResponseDto;
import io.ssafy.chat.domain.chatroom.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {
    private final ChatRoomRepository chatRoomRepository;

    public ChatRoomCreateResponseDto createRoom(String groupName) {
        ChatRoom room = ChatRoom.builder()
                .groupName(groupName)
                .build();
        ChatRoom savedRoom = chatRoomRepository.save(room);
        log.info("[ChatService] Chat room created: roomId={}, groupName={}", savedRoom.getId(), groupName);
        return new ChatRoomCreateResponseDto(savedRoom.getId());
    }
}
