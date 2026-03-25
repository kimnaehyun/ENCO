package io.ssafy.payment.infra.messaging.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnsitePaymentRequestEvent {

    @JsonProperty("groupId")
    private Long groupId;

    @JsonProperty("leaderId")
    private Long leaderId;

    @JsonProperty("leaderName")
    private String leaderName;

    @JsonProperty("timestamp")
    private Long timestamp;
}
