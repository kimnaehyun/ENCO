import { useRef, useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import { Client } from '@stomp/stompjs';
import { chatService } from '@/services/chatService';
import { ApiMessage, ChatItem } from '@/types/chat';

function apiMessageToChatItem(m: ApiMessage): ChatItem {
  // 메시지 ID: 서버는 'id', 레거시는 'messageId'
  const msgId = m.id ?? m.messageId ?? `msg-${Date.now()}`;
  // 메시지 타입: 서버는 'messageType', 레거시는 'type'
  const msgType = m.messageType ?? m.type ?? 'CHAT';

  // 챗봇 응답 판별: BOT_ANSWER 또는 CHATBOT_RESPONSE 또는 senderId가 음수
  const isChatbot =
    msgType === 'BOT_ANSWER' ||
    msgType === 'CHATBOT_RESPONSE' ||
    (m.senderId !== undefined && m.senderId < 0);

  if (isChatbot) {
    return {
      id: msgId,
      type: 'chatbot',
      senderName: m.senderName ?? '햄코',
      senderImageUrl: m.senderImageUrl ?? '',
      content: m.content,
      createdAt: m.createdAt,
    };
  }

  return {
    id: msgId,
    type: 'chat',
    messageType: msgType,
    roomId: String(m.roomId),
    senderId: m.senderId ?? 0,
    senderName: m.senderName,
    senderImageUrl: m.senderImageUrl,
    senderProfileImage: m.senderProfileImage,
    content: m.content,
    metadata: null,
    createdAt: m.createdAt,
    status: 'sent',
  };
}

export function useChat(roomId: string, userId: number) {
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const clientRef = useRef<Client | null>(null);
  const flatListRef = useRef<FlatList<ChatItem>>(null);
  const nextCursorRef = useRef<number | null>(null);
  const isLoadingMoreRef = useRef(false);

  // 최초 메시지 로드
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        console.log('[useChat] 채팅방 입장 - roomId:', roomId, 'userId:', userId);
        const res = await chatService.get(
          `api/v1/chat-rooms/${roomId}/messages`,
          { params: { size: 50 } },
        );
        const data = res.data?.result ?? res.data;
        const rawMessages: ApiMessage[] = Array.isArray(data)
          ? data
          : (data.messages ?? []);
        console.log('[useChat] 메시지 조회 응답 - 메시지 수:', rawMessages.length, '원본 데이터:', JSON.stringify(rawMessages.slice(0, 3)));
        nextCursorRef.current = data.nextCursor ?? null;
        setMessages(rawMessages.reverse().map(apiMessageToChatItem));
      } catch (e) {
        console.error('[useChat] 메시지 조회 실패:', e);
      }
    };
    fetchMessages();
  }, []);

  // WebSocket 연결
  useEffect(() => {
    const client = new Client({
      reconnectDelay: 5000,
      debug: str => console.log(str),
      webSocketFactory: () => new WebSocket('wss://api.ssafywte.site/ws-stomp'),
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
    });

    client.onConnect = () => {
      client.subscribe(`/sub/chat/room/${roomId}`, message => {
        const data: ApiMessage = JSON.parse(message.body);
        const msgType = data.messageType ?? data.type ?? 'CHAT';
        console.log('[useChat] WebSocket 수신:', msgType, 'senderId:', data.senderId);

        // BOT_QUESTION은 서버가 브로드캐스트하는 사용자 질문 — 프론트에서 이미 표시했으므로 무시
        if (msgType === 'BOT_QUESTION') {
          return;
        }

        const chatItem = apiMessageToChatItem(data);

        // 챗봇 응답(BOT_ANSWER)은 그대로 추가
        if (chatItem.type === 'chatbot') {
          setMessages(prev => {
            // 로딩 메시지("추천 결과를 찾고 있어요...") 제거
            const filtered = prev.filter(
              m => !(m.type === 'chatbot' && m.id.startsWith('bot-pick-loading-'))
            );
            return [...filtered, chatItem];
          });
          return;
        }

        // 일반 채팅: sending 상태인 임시 메시지와 매칭하여 교체

        setMessages(prev => {
          const tempIndex = prev.findIndex(
            m =>
              m.type === 'chat' &&
              m.status === 'sending' &&
              m.senderId === data.senderId &&
              m.content === data.content,
          );
          if (tempIndex !== -1) {
            const updated = [...prev];
            updated[tempIndex] = apiMessageToChatItem(data);
            return updated;
          }
          return [...prev, apiMessageToChatItem(data)];
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

  // 이전 메시지 로드
  const loadMoreMessages = async () => {
    if (isLoadingMoreRef.current || nextCursorRef.current === null) return;
    isLoadingMoreRef.current = true;
    try {
      const res = await chatService.get(
        `/api/v1/chat-rooms/${roomId}/messages`,
        { params: { cursor: nextCursorRef.current, size: 50 } },
      );
      const data = res.data?.result ?? res.data;
      const rawMessages: ApiMessage[] = data.messages ?? [];
      nextCursorRef.current = data.nextCursor ?? null;
      const older = rawMessages.reverse().map(apiMessageToChatItem);
      setMessages(prev => [...older, ...prev]);
    } catch (e) {
      console.error('이전 메시지 조회 실패:', e);
    } finally {
      isLoadingMoreRef.current = false;
    }
  };

  const appendChatItem = (item: ChatItem) => {
    setMessages(prev => [...prev, item]);
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  };

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage: ChatItem = {
      id: tempId,
      type: 'chat',
      messageType: 'CHAT',
      roomId,
      senderId: userId,
      content: content.trim(),
      metadata: null,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };
    setMessages(prev => [...prev, tempMessage]);

    if (!clientRef.current?.connected) {
      setMessages(prev =>
        prev.map(m =>
          m.id === tempId ? ({ ...m, status: 'failed' } as ChatItem) : m,
        ),
      );
      return;
    }

    clientRef.current.publish({
      destination: '/pub/chat/message',
      body: JSON.stringify({
        messageType: 'CHAT',
        roomId,
        senderId: userId,
        content: content.trim(),
        metadata: null,
      }),
    });

    setTimeout(() => {
      setMessages(prev =>
        prev.map(m =>
          m.id === tempId && m.type === 'chat' && m.status === 'sending'
            ? ({ ...m, status: 'failed' } as ChatItem)
            : m,
        ),
      );
    }, 5000);
  };

  const retryMessage = (tempId: string, content: string) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === tempId ? ({ ...m, status: 'sending' } as ChatItem) : m,
      ),
    );

    if (!clientRef.current?.connected) {
      setMessages(prev =>
        prev.map(m =>
          m.id === tempId ? ({ ...m, status: 'failed' } as ChatItem) : m,
        ),
      );
      return;
    }

    clientRef.current.publish({
      destination: '/pub/chat/message',
      body: JSON.stringify({
        messageType: 'CHAT',
        roomId,
        senderId: userId,
        content,
        metadata: null,
      }),
    });

    setTimeout(() => {
      setMessages(prev =>
        prev.map(m =>
          m.id === tempId && m.type === 'chat' && m.status === 'sending'
            ? ({ ...m, status: 'failed' } as ChatItem)
            : m,
        ),
      );
    }, 5000);
  };

  const cancelMessage = (tempId: string) => {
    setMessages(prev => prev.filter(m => m.id !== tempId));
  };

  return {
    messages,
    flatListRef,
    loadMoreMessages,
    appendChatItem,
    sendMessage,
    retryMessage,
    cancelMessage,
  };
}