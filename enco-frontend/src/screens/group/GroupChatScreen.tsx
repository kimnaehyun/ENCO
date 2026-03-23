import React, { useRef, useState, useEffect } from 'react';
import {
  FlatList,
  Image,
  ListRenderItem,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CommonParams } from '../../types/common';
import ChatMessage from '../../components/groupChat/ChatMessage';
import { Client } from '@stomp/stompjs';
import { chatService } from '@/services/chatService';
import { ApiMessage, ChatAction, ChatItem } from '@/types/chat';
import { images } from '@/types/images';
import Chatbot from '@/components/groupChat/Chatbot';
import BotUnpaidCard from '@/components/groupChat/BotUnpaidCard';
import BotActions from '@/components/groupChat/BotActions';
import BotLedgerCard from '@/components/groupChat/BotLedGerCard';
import { getCachedAccessToken } from '@/utils/tokenStorage';

// API 응답을 ChatItem으로 변환
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
  // CHAT 또는 기타
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

const TEMP_IS_ADMIN = true;

export default function GroupChatScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const params = (route.params ?? {}) as CommonParams;

  const groupName = params.groupName ?? '회식주의자';
  const isAdmin = TEMP_IS_ADMIN;
  const [userId] = useState(1);
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const clientRef = useRef<Client | null>(null);
  const flatListRef = useRef<FlatList<ChatItem>>(null);
  const ROOM_ID = '1001';

  const token = getCachedAccessToken();

  // cursor 기반 페이지네이션 상태
  const nextCursorRef = useRef<number | null>(null);
  const isLoadingMoreRef = useRef(false);

  const getNowLabel = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const meridiem = hours < 12 ? '오전' : '오후';
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    return `${meridiem} ${displayHour}:${minutes}`;
  };

  // 최초 메시지 로드 (cursor 없이)
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await chatService.get(
          `api/v1/chat-rooms/${ROOM_ID}/messages`,
          { params: { size: 50 } },
        );

        const data = res.data?.result ?? res.data;
        const rawMessages: ApiMessage[] = data.messages ?? [];
        nextCursorRef.current = data.nextCursor ?? null;

        setMessages(rawMessages.reverse().map(apiMessageToChatItem));
      } catch (e) {
        console.error('❌ 메시지 조회 실패:', e);
      }
    };

    fetchMessages();
  }, []);

  // 이전 메시지 추가 로드 (스크롤 상단 도달 시)
  const loadMoreMessages = async () => {
    if (isLoadingMoreRef.current || nextCursorRef.current === null) return;
    isLoadingMoreRef.current = true;

    try {
      const res = await chatService.get(
        `/api/v1/chat-rooms/${ROOM_ID}/messages`,
        { params: { cursor: nextCursorRef.current, size: 50 } },
      );

      const data = res.data?.result ?? res.data;
      const rawMessages: ApiMessage[] = data.messages ?? [];
      nextCursorRef.current = data.nextCursor ?? null;

      const older = rawMessages.reverse().map(apiMessageToChatItem);
      setMessages(prev => [...older, ...prev]);
    } catch (e) {
      console.error('❌ 이전 메시지 조회 실패:', e);
    } finally {
      isLoadingMoreRef.current = false;
    }
  };

  useEffect(() => {
    const client = new Client({
      reconnectDelay: 5000,
      debug: str => console.log(str),
      webSocketFactory: () => new WebSocket('wss://api.ssafywte.site/ws-stomp'),
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
    });

    client.onConnect = () => {
      client.subscribe(`/sub/chat/room/${ROOM_ID}`, message => {
        const data: ApiMessage = JSON.parse(message.body);

        // CHATBOT_RESPONSE는 바로 chatbot 타입으로 추가
        if (data.type === 'CHATBOT_RESPONSE') {
          setMessages(prev => [...prev, apiMessageToChatItem(data)]);
          return;
        }

        // 일반 CHAT: optimistic update 매칭 후 교체
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

  function sendMessage(content: string, senderId: number) {
    if (!content.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage: ChatItem = {
      id: tempId,
      type: 'chat',
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
        roomId: ROOM_ID,
        senderId,
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
  }

  function retryMessage(tempId: string, content: string, senderId: number) {
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
        roomId: ROOM_ID,
        senderId,
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
  }

  // ===== 챗봇 관련 =====
  const appendChatItem = (item: ChatItem) => {
    setMessages(prev => [...prev, item]);
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  };

  const buildHamcoActions = (): ChatItem => ({
    id: `bot-${Date.now()}`,
    type: 'bot-actions',
    text: isAdmin
      ? '안녕하세요! 어떤 작업을 도와드릴까요?'
      : '안녕하세요! 무엇을 도와드릴까요?',
    createdAt: getNowLabel(),
    actions: isAdmin
      ? [
          { label: '정산하기', action: 'settlement' },
          { label: '모임 관리', action: 'admin' },
          { label: '햄코 PICK', action: 'pick' },
        ]
      : [
          { label: '회비 납부', action: 'pay' },
          { label: '투표 확인', action: 'votes' },
          { label: '햄코 PICK', action: 'pick' },
        ],
  });

  const buildSettlementActions = (): ChatItem => ({
    id: `bot-settlement-${Date.now()}`,
    type: 'bot-actions',
    text: '정산을 도와드릴게요!',
    createdAt: getNowLabel(),
    actions: [
      { label: '미납자 알림 보내기', action: 'notice' },
      { label: '후불 정산하기', action: 'settlement' },
      { label: '장부 관리하기', action: 'ledger-unproof' },
    ],
  });

  const buildUnpaidNoticeCard = (): ChatItem => ({
    id: `bot-unpaid-${Date.now()}`,
    type: 'bot-unpaid-card',
    text: '현재 미납 회원은 1명이에요!',
    createdAt: getNowLabel(),
    unpaidCount: 1,
    memberName: '김싸피',
    lastPaidAt: '2026-02-03',
  });

  const buildLedgerCard = (): ChatItem => ({
    id: `bot-ledger-${Date.now()}`,
    type: 'bot-ledger-card',
    text: '현재 누락된 증빙을 1건 발견했어요!',
    createdAt: getNowLabel(),
    missingCount: 1,
    transactionDate: '2026-03-05',
    transactionType: '출금',
    amount: 50000,
  });

  const handleSend = () => {
    const trimmed = msg.trim();
    if (!trimmed) return;

    if (trimmed === '@햄코') {
      appendChatItem({
        id: `user-${Date.now()}`,
        type: 'user',
        text: trimmed,
        createdAt: getNowLabel(),
      });
      setMsg('');
      setTimeout(() => appendChatItem(buildHamcoActions()), 120);
      return;
    }

    sendMessage(trimmed, userId);
  };

  const handleActionPress = (action: ChatAction) => {
    if (action === 'pay') {
      navigation.navigate('GroupPay', { groupId: params.groupId, groupName });
      return;
    }
    if (action === 'votes') {
      navigation.navigate('GroupVotes', { groupId: params.groupId, groupName });
      return;
    }
    if (action === 'admin') {
      navigation.navigate('AdminMenu', { groupId: params.groupId, groupName });
      return;
    }
    if (action === 'ledger-go') {
      navigation.navigate('GroupLedger', {
        groupId: params.groupId,
        groupName,
      });
      return;
    }
    if (action === 'ledger-unproof') {
      appendChatItem(buildLedgerCard());
      return;
    }
    if (action === 'settlement') {
      appendChatItem(buildSettlementActions());
      return;
    }
    if (action === 'notice') {
      appendChatItem(buildUnpaidNoticeCard());
      return;
    }
    if (action === 'pick') {
      appendChatItem({
        id: `bot-pick-${Date.now()}`,
        type: 'bot-actions',
        text: '햄코 PICK은 나중에 추천형 챗봇으로 연결될 예정이에요.',
        createdAt: getNowLabel(),
        actions: isAdmin
          ? [
              { label: '정산하기', action: 'settlement' },
              { label: '모임 관리', action: 'admin' },
            ]
          : [
              { label: '회비 납부', action: 'pay' },
              { label: '투표 확인', action: 'votes' },
            ],
      });
    }
  };

  // ===== 렌더링 =====
  const renderItem: ListRenderItem<ChatItem> = ({ item }) => {
    if (item.type === 'chat') {
      return (
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
      );
    }

    //  서버에서 내려오는 챗봇 응답 (CHATBOT_RESPONSE)
    if (item.type === 'chatbot') {
      return <Chatbot item={item} />;
    }

    // 챗봇 트리거 (@햄코 로컬)
    if (item.type === 'user') {
      return (
        <ChatMessage
          content={item.text}
          senderId={userId}
          isMe={true}
          created_at={item.createdAt}
          status="sent"
        />
      );
    }

    if (item.type === 'bot-unpaid-card') {
      return <BotUnpaidCard item={item} />;
    }

    if (item.type === 'bot-ledger-card') {
      return (
        <BotLedgerCard
          item={item}
          onPress={() => handleActionPress('ledger-go')}
        />
      );
    }

    // bot-actions
    return (
      <BotActions item={item} onpress={action => handleActionPress(action)} />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F0F4FF]" edges={['top']}>
      <View className="flex-row h-14 px-4 border-b border-b-[#D1D5DB] items-center">
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Image source={images.left_arrow} className="mr-3" />
        </Pressable>
        <Text
          className="flex-1 text-lg text-[#1428A0]"
          style={{ fontFamily: 'GmarketSansTTFBold' }}
        >
          {groupName}
        </Text>
      </View>

      <FlatList
        className="flex-1 p-4"
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        // 상단 스크롤 시 이전 메시지 로드
        onEndReachedThreshold={0.1}
        onScrollToIndexFailed={() => {}}
        onRefresh={loadMoreMessages}
        refreshing={false}
        onContentSizeChange={() => {
          const last = messages[messages.length - 1];
          if (last?.type === 'chat' && last.senderId === userId) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
      />

      <View className="mx-3.5 mb-3.5 bg-white rounded-[26px] min-h-[62px] pl-[18px] pr-2.5 flex-row items-center shadow-sm">
        <TextInput
          value={msg}
          onChangeText={setMsg}
          placeholder="메시지를 입력하세요"
          placeholderTextColor="#9CA3AF"
          className="flex-1 h-11 text-base text-[#111111]"
          style={{ paddingVertical: 0 }}
          multiline={false}
          blurOnSubmit={false}
          returnKeyType="send"
          autoCorrect={false}
          autoCapitalize="none"
          onSubmitEditing={handleSend}
        />
        <Pressable
          onPress={handleSend}
          className="w-[42px] h-[42px] rounded-full items-center justify-center"
        >
          <Text
            className="text-[#3B6EF6] text-2xl"
            style={{ fontFamily: 'GmarketSansTTFBold' }}
          >
            ➤
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
