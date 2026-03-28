package io.ssafy.payment.infra.messaging.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.ssafy.payment.infra.messaging.dto.OnsitePaymentRequestEvent;
import io.ssafy.payment.infra.messaging.dto.VoteNotificationEvent;
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
            log.info("[현장결제] 결제 요청 이벤트 발행 - groupId: {}, leaderId: {}, leaderName: {}", groupId, leaderId, leaderName);
        } catch (Exception e) {
            log.error("[현장결제] 결제 요청 이벤트 발행 실패", e);
        }
    }

    public void sendVoteNotification(Long groupId, Long voteId, String title, String message, String type) {
        try {
            VoteNotificationEvent event = VoteNotificationEvent.builder()
                    .groupId(groupId)
                    .voteId(voteId)
                    .title(title)
                    .message(message)
                    .type(type)
                    .timestamp(System.currentTimeMillis())
                    .build();

            String payload = objectMapper.writeValueAsString(event);

            kafkaTemplate.send("vote-notification", String.valueOf(groupId), payload);
            log.info("[Kafka] 투표/결제 알림 이벤트 발행 - groupId: {}, voteId: {}, title : {}, type: {}", groupId, voteId, title, type);
        } catch (Exception e) {
            log.error("[Kafka] 투표/결제 알림 이벤트 발행 실패", e);
        }
    }

    public void sendOnsitePaymentComplete(Long groupId, BigDecimal amount, String merchantName, boolean isSuccess) {
        try {
            Map<String, Object> event = Map.of(
                    "groupId", groupId,
                    "amount", amount,
                    "isSuccess", isSuccess,
                    "merchantName", merchantName,
                    "timestamp", System.currentTimeMillis()
            );

            String message = objectMapper.writeValueAsString(event);

            kafkaTemplate.send("onsite-payment-complete", String.valueOf(groupId), message);
            log.info("[현장결제] 결제 이벤트 발행 - groupId: {}, 가맹점: {}, 성공 여부: {}", groupId, merchantName, isSuccess);

        } catch (Exception e) {
            log.error("[현장결제] 결제 완료 이벤트 발행 실패", e);
        }
    }
}
