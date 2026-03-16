# Chat Service

모임 기반 실시간 채팅 서비스. Spring Boot + MongoDB + WebSocket(STOMP)으로 구현되었습니다.

## 기술 스택

- Java 17, Spring Boot 3.5
- Spring WebSocket (STOMP)
- Spring Data MongoDB
- MongoDB 7.0
- Docker Compose

## 프로젝트 구조

```
src/main/java/io/ssafy/chat/
├── config/                          # 설정
│   ├── WebSocketConfig.java         # STOMP 웹소켓 설정
│   ├── MongoConfig.java             # MongoDB Auditing
│   └── CorsConfig.java              # CORS 허용
├── common/enums/                    # 공통 Enum
│   ├── ParticipantRole.java         # OWNER, MEMBER
│   ├── MessageType.java             # CHAT, SYSTEM, BOT_QUESTION, BOT_ANSWER
│   └── NotificationType.java        # CHAT_MESSAGE, SYSTEM
├── chatroom/                        # 채팅방 도메인
│   ├── document/                    # MongoDB Document
│   ├── dto/                         # 요청/응답 DTO
│   ├── repository/
│   ├── service/
│   └── controller/
├── message/                         # 채팅 메시지 도메인
│   ├── document/
│   ├── dto/
│   ├── repository/
│   ├── service/
│   └── controller/
│       ├── ChatMessageWebSocketController.java  # STOMP 핸들러
│       └── ChatMessageRestController.java       # REST API
└── notification/                    # 알림 도메인
    ├── document/
    ├── dto/
    ├── repository/
    ├── service/
    └── controller/
```

## 실행 방법

### 1. MongoDB 실행

```bash
docker compose --env-file .env.dev up -d
```

정상 확인:
- MongoDB: `localhost:27017`
- Mongo Express (웹 GUI): `http://localhost:8081`

### 2. Spring Boot 실행

IntelliJ에서 `ChatApplication.java` 실행.

Run > Edit Configurations > Environment variables에 아래 값을 추가합니다:

```
MONGO_INITDB_ROOT_USERNAME=root;MONGO_INITDB_ROOT_PASSWORD=ssafy1234;CHAT_DB_HOST=localhost;CHAT_DB_NAME=chat_db
```

서버 포트: `8084`

### 3. 테스트

`ws-test.html`을 브라우저에서 열면 WebSocket 채팅을 테스트할 수 있습니다.

## API 명세

### WebSocket (STOMP)

연결 엔드포인트: `ws://localhost:8084/ws-stomp`

| 기능 | Destination | 방향 | 설명 |
|------|-------------|------|------|
| 메시지 전송 | `/pub/chat/message` | Client → Server | 채팅 메시지 전송 |
| 읽음 처리 | `/pub/chat/read` | Client → Server | 메시지 읽음 처리 |
| 메시지 수신 | `/sub/chat/room/{roomId}` | Server → Client | 채팅방 메시지 브로드캐스트 |
| 읽음 알림 | `/sub/chat/room/{roomId}/read` | Server → Client | 읽음 상태 변경 알림 |
| 실시간 알림 | `/sub/notification/{userId}` | Server → Client | 개인 알림 수신 |

#### 메시지 전송 페이로드

```json
{
  "messageType": "CHAT",
  "roomId": "67c91f0e8c1a4d0f4c6a01a1",
  "senderId": 1,
  "content": "안녕하세요",
  "metadata": null
}
```

#### 읽음 처리 페이로드

```json
{
  "roomId": "67c91f0e8c1a4d0f4c6a01a1",
  "userId": 1,
  "messageId": "67c9204b8c1a4d0f4c6a0201"
}
```

### REST API

#### 채팅방

| Method | URL | 설명 |
|--------|-----|------|
| POST | `/api/v1/chat-rooms` | 채팅방 생성 |
| GET | `/api/v1/chat-rooms?userId={userId}` | 내 채팅방 목록 |
| GET | `/api/v1/chat-rooms/{chatRoomId}` | 채팅방 상세 조회 |
| POST | `/api/v1/chat-rooms/{chatRoomId}/join?userId={userId}` | 채팅방 참여 |
| DELETE | `/api/v1/chat-rooms/{chatRoomId}/leave?userId={userId}` | 채팅방 나가기 |

#### 메시지

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/v1/chat-rooms/{chatRoomId}/messages?page=0&size=50` | 채팅 히스토리 조회 |

#### 알림

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/v1/notifications?userId={userId}` | 알림 목록 |
| GET | `/api/v1/notifications/unread?userId={userId}` | 읽지 않은 알림 |
| GET | `/api/v1/notifications/unread/count?userId={userId}` | 읽지 않은 알림 개수 |
| PATCH | `/api/v1/notifications/{notificationId}/read` | 알림 읽음 처리 |
| PATCH | `/api/v1/notifications/read-all?userId={userId}` | 전체 읽음 처리 |

## MongoDB 컬렉션

### chat_room

| Field | Type | 설명 |
|-------|------|------|
| _id | ObjectId | 채팅방 ID |
| groupId | Long | 연결된 모임 ID |
| participants | Array | 참여자 목록 (userId, role, joinedAt, lastReadMessageId) |
| lastMessage | Object | 마지막 메시지 정보 |
| isDeleted | Boolean | 삭제 여부 |
| createdAt / updatedAt / deletedAt | Date | 시간 정보 |

### chat_message

| Field | Type | 설명 |
|-------|------|------|
| _id | ObjectId | 메시지 ID |
| messageType | String | CHAT, SYSTEM, BOT_QUESTION, BOT_ANSWER |
| roomId | ObjectId | 채팅방 ID |
| senderId | Long | 발신자 ID |
| content | String | 메시지 내용 |
| metadata | Object | 추가 데이터 |
| isDeleted | Boolean | 삭제 여부 |

### notification

| Field | Type | 설명 |
|-------|------|------|
| _id | ObjectId | 알림 ID |
| userId | Long | 대상 사용자 ID |
| type | String | CHAT_MESSAGE, SYSTEM |
| title / message | String | 알림 제목/내용 |
| data | Object | 관련 데이터 (roomId, messageId 등) |
| isRead | Boolean | 읽음 여부 |

## 메시지 흐름

```
1. 클라이언트가 /pub/chat/message 로 메시지 전송
2. ChatMessageWebSocketController 수신
3. ChatMessageService → MongoDB에 메시지 저장
4. ChatRoom의 lastMessage 업데이트
5. /sub/chat/room/{roomId} 로 참여자 전원에게 브로드캐스트
6. 발신자 제외 참여자에게 /sub/notification/{userId} 알림 전송
```

## 환경변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| MONGO_INITDB_ROOT_USERNAME | MongoDB 계정 | root |
| MONGO_INITDB_ROOT_PASSWORD | MongoDB 비밀번호 | ssafy1234 |
| CHAT_DB_HOST | MongoDB 호스트 | localhost |
| CHAT_DB_NAME | 데이터베이스명 | chat_db |

## 주의사항

- MongoDB 볼륨을 초기화하려면 `docker compose down -v` 후 다시 실행해야 합니다. `MONGO_INITDB_*` 환경변수는 최초 볼륨 생성 시에만 적용됩니다.
- `.env.dev` 파일은 Docker Compose가 자동으로 읽지 않으므로 `--env-file .env.dev` 옵션을 사용해야 합니다.
