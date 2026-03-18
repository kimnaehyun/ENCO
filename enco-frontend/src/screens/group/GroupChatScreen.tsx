import { Button, Text, View, FlatList, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { CommonParams } from '../../types/common';
import ChatInput from '../../components/groupChat/ChatInput';
import SubmitButton from '../../components/groupChat/SubmitButton';
import ChatMessage from '../../components/groupChat/ChatMessage';
import { useState, useEffect, useRef } from 'react';
import { Message } from '../../types/group';
import { Client } from '@stomp/stompjs';

export default function GroupChatScreen() {
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;
  const [msg, setMsg] = useState<string>('');
  const [userId] = useState(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const clientRef = useRef<Client | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const ROOM_ID = '1001';

  useEffect(() => {
    // 이전 메시지 불러오기
    fetch(
      `http://10.0.2.2:8084/api/v1/chat-rooms/${ROOM_ID}/messages?page=0&size=50`,
    )
      .then(res => res.json())
      .then(data => {
        // 오래된 순으로 정렬
        setMessages(
          data.reverse().map((m: Message) => ({ ...m, status: 'sent' })),
        );
      })
      .catch(e => console.error('❌ 메시지 조회 실패:', e));
    const client = new Client({
      brokerURL: 'ws://10.0.2.2:8084/ws-stomp',
      reconnectDelay: 5000,
      debug: str => console.log(str),
      webSocketFactory: () => new WebSocket('ws://10.0.2.2:8084/ws-stomp'),
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
    });

    client.onConnect = () => {
      console.log('STOMP 연결됨');

      client.subscribe(`/sub/chat/room/${ROOM_ID}`, message => {
        const data = JSON.parse(message.body);

        setMessages(prev => {
          // 내가 보낸 메시지면 tempId → 실제 id로 교체
          const tempIndex = prev.findIndex(
            m =>
              m.status === 'sending' &&
              m.senderId === data.senderId &&
              m.content === data.content,
          );

          if (tempIndex !== -1) {
            const updated = [...prev];
            updated[tempIndex] = { ...data, status: 'sent' };
            return updated;
          }

          // 남이 보낸 메시지면 그냥 추가
          return [...prev, { ...data, status: 'sent' }];
        });
      });
    };

    client.onStompError = frame => console.error('STOMP error', frame);

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  function sendMessage(content: string, senderId: number) {
    if (!content.trim()) return;

    // 1. 임시 메시지 즉시 추가 (status: 'sending'), 연결 여부 관계없이 일단 메시지 추가
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      messageType: 'CHAT',
      roomId: ROOM_ID,
      senderId,
      content: content.trim(),
      metadata: null,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };
    setMessages(prev => [...prev, tempMessage]);
    setMsg('');

    // 2. 실제 전송, 연결 안 됐으면 바로 failed 처리
    if (!clientRef.current?.connected) {
      setMessages(prev =>
        prev.map(m => (m.id === tempId ? { ...m, status: 'failed' } : m)),
      );
      return;
    }

    // 3. 일정 시간 후에도 서버 응답 없으면 failed 처리, 연결됐으면 전송 후 타임아웃
    clientRef.current.publish({
      destination: '/pub/chat/message',
      body: JSON.stringify({
        messageType: 'CHAT',
        roomId: ROOM_ID,
        senderId,
        content: content.trim(),
        metadata: null,
      }),
    });

    setTimeout(() => {
      setMessages(prev =>
        prev.map(m =>
          m.id === tempId && m.status === 'sending'
            ? { ...m, status: 'failed' }
            : m,
        ),
      );
    }, 5000);
  }
  // 재전송 전용 함수
  function retryMessage(tempId: string, content: string, senderId: number) {
    // ✅ 상태만 sending으로 변경 (새 메시지 추가 없음)
    setMessages(prev =>
      prev.map(m => (m.id === tempId ? { ...m, status: 'sending' } : m)),
    );

    // ✅ 연결 안 됐으면 바로 failed
    if (!clientRef.current?.connected) {
      setMessages(prev =>
        prev.map(m => (m.id === tempId ? { ...m, status: 'failed' } : m)),
      );
      return;
    }

    // ✅ 전송 시도
    clientRef.current.publish({
      destination: '/pub/chat/message',
      body: JSON.stringify({
        messageType: 'CHAT',
        roomId: ROOM_ID,
        senderId,
        content,
        metadata: null,
      }),
    });

    setTimeout(() => {
      setMessages(prev =>
        prev.map(m =>
          m.id === tempId && m.status === 'sending'
            ? { ...m, status: 'failed' }
            : m,
        ),
      );
    }, 5000);
  }
  return (
    <View className="flex-1 bg-[#F0F4FF]">
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        className="border border-black border-solid"
      >
        <Text style={{ fontSize: 20, fontWeight: '900' }}>
          커뮤니티(톡방) {params.groupName ? `- ${params.groupName}` : ''}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        className="flex-1"
        data={messages}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <ChatMessage
            content={item.content}
            senderId={item.senderId}
            isMe={item.senderId === userId}
            created_at={item.createdAt}
            status={item.status}
            onRetry={() => retryMessage(item.id, item.content, item.senderId)}
            onCancel={() =>
              setMessages(prev => prev.filter(m => m.id !== item.id))
            }
          />
        )}
        onContentSizeChange={() => {
          if (messages[messages.length - 1]?.senderId === userId) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
      />

      <View className="flex-row border border-black border-solid p-3 items-center">
        <ChatInput
          msg={msg}
          msgValue={setMsg}
          className="flex-[9] bg-gray-300 rounded-xl px-4 max-h-40"
        />
        <SubmitButton
          onPress={() => sendMessage(msg, userId)}
          className="flex-[1] ml-5 rounded-full h-10"
        />
      </View>
    </View>
  );
}
