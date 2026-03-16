package io.ssafy.payment.domain.test;

import io.ssafy.payment.infra.messaging.producer.KafkaProducerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class KafkaTestController {

    private final KafkaProducerService producerService;

    @GetMapping("/kafka/test") // http://localhost:8084/kafka/test?message=hello
    public String test(@RequestParam String message) {
        log.info("완료: {}", message);
        producerService.send("test-topic", message);
        return "sent: " + message;
    }
}
