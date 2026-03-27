package io.ssafy.chat.message.service;

import io.ssafy.chat.domain.chatroom.document.LastMessage;
import io.ssafy.chat.domain.chatroom.repository.ChatRoomRepository;
import io.ssafy.chat.common.enums.MessageType;
import io.ssafy.chat.infra.client.AuthServiceClient;
import io.ssafy.chat.infra.client.UserDetailDto;
import io.ssafy.chat.message.document.ChatMessage;
import io.ssafy.chat.message.dto.ChatMessageRequest;
import io.ssafy.chat.message.dto.ChatMessageResponse;
import io.ssafy.chat.message.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final AuthServiceClient authServiceClient;

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

        ChatMessageResponse response = ChatMessageResponse.from(saved);
        enrichSenderInfo(List.of(response));
        return response;
    }

    /**
     * 채팅방 메시지 목록 조회 (최신순, 페이징)
     */
    public List<ChatMessageResponse> getMessages(String roomId, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        List<ChatMessage> messages = chatMessageRepository
                .findByRoomIdAndIsDeletedFalseOrderByCreatedAtDesc(roomId, pageable);

        List<ChatMessageResponse> responses = messages.stream()
                .map(ChatMessageResponse::from)
                .toList();
        enrichSenderInfo(responses);
        return responses;
    }

    /**
     * 특정 메시지 이전 메시지 조회 (무한스크롤용)
     */
    public List<ChatMessageResponse> getMessagesBefore(String roomId, String beforeMessageId, int size) {
        PageRequest pageable = PageRequest.of(0, size);
        List<ChatMessage> messages = chatMessageRepository
                .findByRoomIdAndIsDeletedFalseAndIdLessThanOrderByCreatedAtDesc(
                        roomId, beforeMessageId, pageable);

        List<ChatMessageResponse> responses = messages.stream()
                .map(ChatMessageResponse::from)
                .toList();
        enrichSenderInfo(responses);
        return responses;
    }

    private void enrichSenderInfo(List<ChatMessageResponse> responses) {
        List<Long> senderIds = responses.stream()
                .map(ChatMessageResponse::getSenderId)
                .distinct()
                .toList();

        if (senderIds.isEmpty()) return;

        try {
            Map<Long, UserDetailDto> userMap = authServiceClient.getUserDetails(senderIds)
                    .result().stream()
                    .collect(Collectors.toMap(UserDetailDto::getUserId, u -> u));

            for (ChatMessageResponse response : responses) {
                UserDetailDto user = userMap.get(response.getSenderId());
                if (user != null) {
                    response.enrichSenderInfo(user.getName(), user.getProfileImage());
                }
            }
        } catch (Exception e) {
            log.warn("유저 정보 조회 실패 - senderIds: {}", senderIds, e);
        }
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
