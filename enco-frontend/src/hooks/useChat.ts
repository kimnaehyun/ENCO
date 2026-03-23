import { useRef, useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import { Client } from '@stomp/stompjs';
import { chatService } from '@/services/chatService';
import { ApiMessage, ChatItem } from '@/types/chat';

function apiMessageToChatItem(m: ApiMessage): ChatItem {
  if (m.type === 'CHATBOT_RESPONSE') {
    return {
      id: m.messageId,
      type: 'chatbot',
      senderName: m.senderName,
      senderImageUrl: m.senderImageUrl,
      content: m.content,
      createdAt: m.createdAt,
    };
  }
  return {
    id: m.messageId,
    type: 'chat',
    messageType: m.type,
    roomId: String(m.roomId),
    senderId: m.senderId ?? 0,
    senderName: m.senderName,
    senderImageUrl: m.senderImageUrl,
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
        const res = await chatService.get(
          `api/v1/chat-rooms/${roomId}/messages`,
          { params: { size: 50 } },
        );
        const data = res.data?.result ?? res.data;
        const rawMessages: ApiMessage[] = Array.isArray(data)
          ? data
          : (data.messages ?? []);
        nextCursorRef.current = data.nextCursor ?? null;
        setMessages(rawMessages.reverse().map(apiMessageToChatItem));
      } catch (e) {
        console.error('메시지 조회 실패:', e);
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

        if (data.type === 'CHATBOT_RESPONSE') {
          setMessages(prev => [...prev, apiMessageToChatItem(data)]);
          return;
        }

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
