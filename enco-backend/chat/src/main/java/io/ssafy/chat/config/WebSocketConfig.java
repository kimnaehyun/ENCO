package io.ssafy.chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * STOMP 메시지 브로커 설정
     *
     * /sub  → 클라이언트가 구독하는 prefix (서버 → 클라이언트)
     * /pub  → 클라이언트가 메시지를 보내는 prefix (클라이언트 → 서버)
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 클라이언트가 구독할 prefix
        // ex) /sub/chat/room/{roomId}
        registry.enableSimpleBroker("/sub");

        // 클라이언트가 메시지를 보낼 prefix
        // ex) /pub/chat/message
        registry.setApplicationDestinationPrefixes("/pub");
    }

    /**
     * WebSocket 연결 엔드포인트
     * 클라이언트는 ws://localhost:8084/ws-stomp 로 연결
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-stomp")
                .setAllowedOriginPatterns("*")  // CORS 허용 (개발용)
                .withSockJS();                   // SockJS fallback 지원
    }
}
