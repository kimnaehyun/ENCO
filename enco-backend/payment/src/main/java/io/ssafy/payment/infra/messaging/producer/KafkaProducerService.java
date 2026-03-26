package io.ssafy.payment.infra.messaging.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.ssafy.payment.infra.messaging.event.OnsitePaymentRequestEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class KafkaProducerService {
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void send(String topic, String message) {
        kafkaTemplate.send(topic, message);
        log.info("Sent: {}", message);
    }

    public void sendOnsitePaymentRequest(Long groupId, Long leaderId, String leaderName) {
        try {
            OnsitePaymentRequestEvent event = OnsitePaymentRequestEvent.builder()
                    .groupId(groupId)
                    .leaderId(leaderId)
                    .leaderName(leaderName)
                    .timestamp(System.currentTimeMillis())
                    .build();

            String message = objectMapper.writeValueAsString(event);
            kafkaTemplate.send("onsite-payment-request", String.valueOf(groupId), message);
            log.info("[현장결제] 결제 요청 이벤트 발행 - groupId: {}, leaderId: {}", groupId, leaderId);
        } catch (Exception e) {
            log.error("[현장결제] 결제 요청 이벤트 발행 실패", e);
        }
    }

    public void sendOnsitePaymentComplete(Long groupId, BigDecimal amount, String merchantName) {
        try {
            Map<String, Object> event = Map.of(
                    "groupId", groupId,
                    "amount", amount,
                    "merchantName", merchantName,
                    "timestamp", System.currentTimeMillis()
            );

            String message = objectMapper.writeValueAsString(event);

            kafkaTemplate.send("onsite-payment-complete", String.valueOf(groupId), message);
            log.info("[현장결제] 결제 완료 이벤트 발행 - groupId: {}, 가맹점: {}", groupId, merchantName);

        } catch (Exception e) {
            log.error("[현장결제] 결제 완료 이벤트 발행 실패", e);
        }
    }
}
