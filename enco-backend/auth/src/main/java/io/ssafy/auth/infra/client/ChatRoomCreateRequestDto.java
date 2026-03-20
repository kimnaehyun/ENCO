package io.ssafy.auth.infra.client;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class ChatRoomCreateRequestDto {

    private Long groupId;
    private List<Long> participantIds;
}
