package io.ssafy.chat.chatroom.repository;

import io.ssafy.chat.chatroom.document.ChatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends MongoRepository<ChatRoom, String> {

    // 사용자가 참여 중인 채팅방 목록 (최근 업데이트순)
    @Query("{ 'participants.userId': ?0, 'isDeleted': false }")
    List<ChatRoom> findByParticipantUserId(Long userId);

    // 모임 ID로 채팅방 조회
    Optional<ChatRoom> findByGroupIdAndIsDeletedFalse(Long groupId);
}
