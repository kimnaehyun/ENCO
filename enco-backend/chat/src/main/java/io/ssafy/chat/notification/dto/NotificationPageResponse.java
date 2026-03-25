package io.ssafy.chat.notification.dto;

import java.util.List;

public record NotificationPageResponse(
        List<NotificationResponse> notifications,
        Long nextCursor,
        boolean hasNext
) {
}
