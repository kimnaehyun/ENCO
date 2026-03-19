package io.ssafy.chat.message.repository;

import io.ssafy.chat.message.document.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    // 채팅방의 메시지 목록 (최신순, 페이징)
    List<ChatMessage> findByRoomIdAndIsDeletedFalseOrderByCreatedAtDesc(String roomId, Pageable pageable);

    // 특정 메시지 이전의 메시지 목록 (무한스크롤용)
    List<ChatMessage> findByRoomIdAndIsDeletedFalseAndIdLessThanOrderByCreatedAtDesc(
            String roomId, String messageId, Pageable pageable);
}
