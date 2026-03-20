package io.ssafy.chat.domain.chatroom.service;

import io.ssafy.chat.domain.chatroom.document.ChatRoom;
import io.ssafy.chat.domain.chatroom.document.Participant;
import io.ssafy.chat.domain.chatroom.dto.ChatRoomCreateRequest;
import io.ssafy.chat.domain.chatroom.dto.ChatRoomResponse;
import io.ssafy.chat.domain.chatroom.repository.ChatRoomRepository;
import io.ssafy.chat.common.enums.ParticipantRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;

    /**
     * 채팅방 생성
     */
    public ChatRoomResponse createRoom(Long userId, ChatRoomCreateRequest request) {
        Participant owner = Participant.builder()
                .userId(userId)
                .role(ParticipantRole.OWNER)
                .joinedAt(LocalDateTime.now())
                .build();

        List<Participant> participants = new java.util.ArrayList<>();
        participants.add(owner);

        // 추가 참여자가 있으면 MEMBER로 추가
        if (request.getParticipantIds() != null) {
            request.getParticipantIds().stream()
                    .filter(id -> !id.equals(userId))
                    .map(id -> Participant.builder()
                            .userId(id)
                            .role(ParticipantRole.MEMBER)
                            .joinedAt(LocalDateTime.now())
                            .build())
                    .forEach(participants::add);
        }

        ChatRoom room = ChatRoom.builder()
                .groupId(request.getGroupId())
                .participants(participants)
                .build();

        ChatRoom saved = chatRoomRepository.save(room);
        log.info("채팅방 생성 완료 - roomId: {}, groupId: {}", saved.getId(), saved.getGroupId());

        return ChatRoomResponse.from(saved);
    }

    /**
     * 내 채팅방 목록 조회
     */
    public List<ChatRoomResponse> getMyRooms(Long userId) {
        return chatRoomRepository.findByParticipantUserId(userId).stream()
                .map(ChatRoomResponse::from)
                .toList();
    }

    /**
     * 채팅방 단건 조회
     */
    public ChatRoomResponse getRoom(String roomId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다: " + roomId));
        return ChatRoomResponse.from(room);
    }

    /**
     * 채팅방 참여자 추가
     */
    public ChatRoomResponse addParticipant(String roomId, Long userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다: " + roomId));

        boolean alreadyJoined = room.getParticipants().stream()
                .anyMatch(p -> p.getUserId().equals(userId));

        if (alreadyJoined) {
            throw new IllegalArgumentException("이미 참여 중인 사용자입니다: " + userId);
        }

        room.addParticipant(Participant.builder()
                .userId(userId)
                .role(ParticipantRole.MEMBER)
                .joinedAt(LocalDateTime.now())
                .build());

        chatRoomRepository.save(room);
        log.info("참여자 추가 - roomId: {}, userId: {}", roomId, userId);

        return ChatRoomResponse.from(room);
    }

    /**
     * 채팅방 나가기
     */
    public void leaveRoom(String roomId, Long userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다: " + roomId));

        room.removeParticipant(userId);

        // 참여자가 0명이면 soft delete
        if (room.getParticipants().isEmpty()) {
            room.softDelete();
            log.info("채팅방 삭제 (참여자 없음) - roomId: {}", roomId);
        }

        chatRoomRepository.save(room);
        log.info("채팅방 나가기 - roomId: {}, userId: {}", roomId, userId);
    }
}
