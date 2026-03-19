package io.ssafy.chat.notification.document;

import io.ssafy.chat.common.enums.NotificationType;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@NoArgsConstructor
@Document(collection = "notification")
public class Notification {

    @Id
    private String id;

    private Long userId;

    private NotificationType type;

    private String title;

    private String message;

    private Map<String, Object> data;

    private Boolean isRead;

    private LocalDateTime createdAt;

    @Builder
    public Notification(Long userId, NotificationType type, String title,
                        String message, Map<String, Object> data) {
        this.userId = userId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.data = data;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }

    public void markAsRead() {
        this.isRead = true;
    }
}
