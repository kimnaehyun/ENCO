package io.ssafy.payment.infra.messaging.consumer;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class KafkaConsumerService {
    @KafkaListener(topics = "test-topic", groupId = "payment-service")
    public void consume(String message) {
        log.info("Received: {}", message);
    }
}
