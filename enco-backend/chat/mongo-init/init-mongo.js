// MongoDB 초기화 스크립트
// docker-entrypoint-initdb.d 에서 자동 실행됨

const dbName = process.env.MONGO_INITDB_DATABASE || 'chat_db';
db = db.getSiblingDB(dbName);

print('========================================');
print(`Initializing database: ${dbName}`);
print('========================================');

// ===== 1. chat_room 컬렉션 =====
db.createCollection('chat_room');
print('Created collection: chat_room');

// 인덱스
db.chat_room.createIndex({ 'participants.userId': 1 }, { name: 'idx_participants_userId' });
db.chat_room.createIndex({ 'groupId': 1 }, { name: 'idx_groupId' });
db.chat_room.createIndex({ 'isDeleted': 1, 'updatedAt': -1 }, { name: 'idx_isDeleted_updatedAt' });

print('Created indexes for chat_room');

// ===== 2. chat_message 컬렉션 =====
db.createCollection('chat_message');
print('Created collection: chat_message');

// 인덱스
db.chat_message.createIndex({ 'roomId': 1, 'createdAt': -1 }, { name: 'idx_roomId_createdAt' });
db.chat_message.createIndex({ 'roomId': 1, 'isDeleted': 1 }, { name: 'idx_roomId_isDeleted' });
db.chat_message.createIndex({ 'senderId': 1 }, { name: 'idx_senderId' });

print('Created indexes for chat_message');

// ===== 3. notification 컬렉션 =====
db.createCollection('notification');
print('Created collection: notification');

// 인덱스
db.notification.createIndex({ 'userId': 1, 'isRead': 1, 'createdAt': -1 }, { name: 'idx_userId_isRead_createdAt' });
db.notification.createIndex({ 'userId': 1, 'type': 1 }, { name: 'idx_userId_type' });

print('Created indexes for notification');

// ===== 샘플 데이터 (개발용) =====
print('');
print('Inserting sample data...');

// 채팅방 샘플
const roomId = ObjectId('67c91f0e8c1a4d0f4c6a01a1');
const messageId = ObjectId('67c9204b8c1a4d0f4c6a0201');

db.chat_room.insertOne({
  _id: roomId,
  groupId: Long('1001'),
  participants: [
    {
      userId: Long('1'),
      role: 'OWNER',
      joinedAt: new Date('2026-03-06T10:00:00Z'),
      lastReadMessageId: messageId
    },
    {
      userId: Long('2'),
      role: 'MEMBER',
      joinedAt: new Date('2026-03-06T10:01:00Z'),
      lastReadMessageId: messageId
    },
    {
      userId: Long('3'),
      role: 'MEMBER',
      joinedAt: new Date('2026-03-06T10:03:00Z'),
      lastReadMessageId: null
    }
  ],
  lastMessage: {
    messageId: messageId,
    senderId: Long('1'),
    content: '오늘 정산 얘기 8시에 할까요?',
    sentAt: new Date('2026-03-06T11:20:00Z')
  },
  isDeleted: false,
  createdAt: new Date('2026-03-06T10:00:00Z'),
  updatedAt: new Date('2026-03-06T11:20:00Z'),
  deletedAt: null
});

print('Inserted sample chat_room');

// 메시지 샘플
db.chat_message.insertOne({
  _id: messageId,
  messageType: 'CHAT',
  roomId: roomId,
  senderId: Long('1'),
  content: '오늘 정산 얘기 8시에 할까요?',
  metadata: null,
  isDeleted: false,
  createdAt: new Date('2026-03-06T11:20:00Z'),
  updatedAt: new Date('2026-03-06T11:20:00Z'),
  deletedAt: null
});

print('Inserted sample chat_message');

// 알림 샘플
db.notification.insertOne({
  _id: ObjectId('67c9320f8c1a4d0f4c6a0501'),
  userId: Long('2'),
  type: 'CHAT_MESSAGE',
  title: '새 메시지',
  message: 'OO님이 메시지를 보냈습니다.',
  data: {
    roomId: roomId.str,
    messageId: messageId.str
  },
  isRead: false,
  createdAt: new Date('2026-03-06T12:00:00Z')
});

print('Inserted sample notification');

print('');
print('========================================');
print('Database initialization complete!');
print('========================================');
