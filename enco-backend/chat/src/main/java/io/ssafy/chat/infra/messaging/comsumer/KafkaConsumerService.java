package io.ssafy.chat.infra.messaging.comsumer;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class KafkaConsumerService {
    @KafkaListener(topics = "test-topic", groupId = "chat-service")
    public void consume(String message) {
        log.info("Received: {}", message);
    }
}
