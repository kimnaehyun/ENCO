package io.ssafy.chat.notification.dto;

import java.util.List;

public record NotificationReadRequest(
        List<String> notifications
) {
}
