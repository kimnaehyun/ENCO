package io.ssafy.chat.message.service;

import io.ssafy.chat.domain.chatroom.document.LastMessage;
import io.ssafy.chat.domain.chatroom.repository.ChatRoomRepository;
import io.ssafy.chat.common.enums.MessageType;
import io.ssafy.chat.message.document.ChatMessage;
import io.ssafy.chat.message.dto.ChatMessageRequest;
import io.ssafy.chat.message.dto.ChatMessageResponse;
import io.ssafy.chat.message.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;

    /**
     * 메시지 저장 + 채팅방 lastMessage 업데이트
     */
    public ChatMessageResponse saveMessage(ChatMessageRequest request) {
        // 1. 메시지 저장
        ChatMessage message = ChatMessage.builder()
                .messageType(request.getMessageType() != null ? request.getMessageType() : MessageType.CHAT)
                .roomId(request.getRoomId())
                .senderId(request.getSenderId())
                .content(request.getContent())
                .metadata(request.getMetadata())
                .build();

        ChatMessage saved = chatMessageRepository.save(message);
        log.info("메시지 저장 완료 - roomId: {}, senderId: {}", saved.getRoomId(), saved.getSenderId());

        // 2. 채팅방 lastMessage 업데이트
        chatRoomRepository.findById(request.getRoomId()).ifPresent(room -> {
            room.updateLastMessage(LastMessage.builder()
                    .messageId(saved.getId())
                    .senderId(saved.getSenderId())
                    .content(saved.getContent())
                    .sentAt(saved.getCreatedAt())
                    .build());
            chatRoomRepository.save(room);
        });

        return ChatMessageResponse.from(saved);
    }

    /**
     * 채팅방 메시지 목록 조회 (최신순, 페이징)
     */
    public List<ChatMessageResponse> getMessages(String roomId, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        List<ChatMessage> messages = chatMessageRepository
                .findByRoomIdAndIsDeletedFalseOrderByCreatedAtDesc(roomId, pageable);

        return messages.stream()
                .map(ChatMessageResponse::from)
                .toList();
    }

    /**
     * 특정 메시지 이전 메시지 조회 (무한스크롤용)
     */
    public List<ChatMessageResponse> getMessagesBefore(String roomId, String beforeMessageId, int size) {
        PageRequest pageable = PageRequest.of(0, size);
        List<ChatMessage> messages = chatMessageRepository
                .findByRoomIdAndIsDeletedFalseAndIdLessThanOrderByCreatedAtDesc(
                        roomId, beforeMessageId, pageable);

        return messages.stream()
                .map(ChatMessageResponse::from)
                .toList();
    }

    /**
     * 메시지 삭제 (soft delete)
     */
    public void deleteMessage(String messageId, Long userId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("메시지를 찾을 수 없습니다: " + messageId));

        if (!message.getSenderId().equals(userId)) {
            throw new IllegalArgumentException("본인의 메시지만 삭제할 수 있습니다.");
        }

        message.softDelete();
        chatMessageRepository.save(message);
        log.info("메시지 삭제 완료 - messageId: {}", messageId);
    }
}
