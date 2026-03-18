package io.ssafy.auth.infra.messaging.producer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class GroupEventProducer {

    public static final String GROUP_CREATED_TOPIC = "group.created";
    public static final String GROUP_DELETED_TOPIC = "group.deleted";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    // 그룹 API 완성 후 그룹 생성 시 호출
    public void sendGroupCreated(Long groupId, String name) {
        send(GROUP_CREATED_TOPIC, new GroupEvent(groupId, name));
    }

    // 그룹 API 완성 후 그룹 삭제 시 호출
    public void sendGroupDeleted(Long groupId) {
        send(GROUP_DELETED_TOPIC, new GroupEvent(groupId, null));
    }

    private void send(String topic, GroupEvent event) {
        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(topic, payload);
            log.info("[GroupEventProducer] topic={}, payload={}", topic, payload);
        } catch (JsonProcessingException e) {
            log.error("[GroupEventProducer] 직렬화 실패: {}", e.getMessage());
        }
    }

    public record GroupEvent(Long groupId, String name) {}
}
