import React, { useRef, useState, useEffect } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CommonParams } from '../../types/common';
import ChatMessage from '../../components/groupChat/ChatMessage';
import { Client } from '@stomp/stompjs';

type ChatAction =
  | 'pay'
  | 'notice'
  | 'votes'
  | 'pick'
  | 'settlement'
  | 'admin'
  | 'ledger-unproof'
  | 'ledger-go';

type ChatItem =
  | {
      id: string;
      type: 'chat'; // ✅ 실제 채팅 메시지
      senderId: number;
      content: string;
      createdAt: string;
      status: 'sending' | 'sent' | 'failed';
      metadata: null;
      roomId: string;
      messageType: string;
    }
  | {
      id: string;
      type: 'user'; // ✅ 챗봇 트리거 메시지
      text: string;
      createdAt: string;
    }
  | {
      id: string;
      type: 'bot-actions';
      text: string;
      createdAt: string;
      actions: Array<{ label: string; action: ChatAction }>;
    }
  | {
      id: string;
      type: 'bot-unpaid-card';
      text: string;
      createdAt: string;
      unpaidCount: number;
      memberName: string;
      lastPaidAt: string;
    }
  | {
      id: string;
      type: 'bot-ledger-card';
      text: string;
      createdAt: string;
      missingCount: number;
      transactionDate: string;
      transactionType: string;
      amount: number;
    };

const TEMP_IS_ADMIN = true;
const formatKRW = (n: number) =>
  `${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원`;

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

  const getNowLabel = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const meridiem = hours < 12 ? '오전' : '오후';
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    return `${meridiem} ${displayHour}:${minutes}`;
  };

  useEffect(() => {
    // 이전 메시지 불러오기
    fetch(
      `http://10.0.2.2:8084/api/v1/chat-rooms/${ROOM_ID}/messages?page=0&size=50`,
    )
      .then(res => res.json())
      .then(data => {
        setMessages(
          data
            .reverse()
            .map((m: any) => ({ ...m, type: 'chat', status: 'sent' })),
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
      client.subscribe(`/sub/chat/room/${ROOM_ID}`, message => {
        const data = JSON.parse(message.body);
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
            updated[tempIndex] = { ...data, type: 'chat', status: 'sent' };
            return updated;
          }
          return [...prev, { ...data, type: 'chat', status: 'sent' }];
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
      // 챗봇 트리거는 ChatItem 'user' 타입으로 추가
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

    // 일반 메시지는 STOMP로 전송
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

  const handleSendReminder = (memberName: string) => {
    Alert.alert('알림', `${memberName}님에게 미납 알림을 보냈습니다. (임시)`);
  };

  // ===== 렌더링 =====
  const renderItem: ListRenderItem<ChatItem> = ({ item }) => {
    // 실제 채팅 메시지
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

    // 챗봇 트리거 (@햄코)
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
      return (
        <View style={styles.botRow}>
          <Image
            source={require('../../assets/icons/nomal_hamco.png')}
            style={styles.botAvatar}
            resizeMode="contain"
          />
          <View style={styles.botCard}>
            <View style={styles.unpaidTitleRow}>
              <Text style={styles.unpaidTitlePrefix}>현재 미납 회원은 </Text>
              <Text style={styles.unpaidTitleCount}>{item.unpaidCount}명</Text>
              <Text style={styles.unpaidTitlePrefix}>이에요!</Text>
            </View>
            <View style={styles.unpaidMemberCard}>
              <Image
                source={require('../../assets/icons/nomal_hamco.png')}
                style={styles.unpaidMemberAvatar}
                resizeMode="contain"
              />
              <View style={styles.unpaidMemberInfo}>
                <Text style={styles.unpaidMemberName}>{item.memberName}</Text>
                <Text style={styles.unpaidMemberDate}>
                  마지막 납입일 {item.lastPaidAt}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => handleSendReminder(item.memberName)}
              style={styles.remindButton}
            >
              <Text style={styles.remindButtonText}>알림 보내기</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    if (item.type === 'bot-ledger-card') {
      return (
        <View style={styles.botRow}>
          <Image
            source={require('../../assets/icons/nomal_hamco.png')}
            style={styles.botAvatar}
            resizeMode="contain"
          />
          <View style={styles.botCard}>
            <View style={styles.unpaidTitleRow}>
              <Text style={styles.unpaidTitlePrefix}>현재 누락된 증빙을 </Text>
              <Text style={styles.unpaidTitleCount}>{item.missingCount}건</Text>
              <Text style={styles.unpaidTitlePrefix}> 발견했어요!</Text>
            </View>
            <View style={styles.ledgerInfoCard}>
              <Text style={styles.ledgerDate}>{item.transactionDate}</Text>
              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerType}>{item.transactionType}</Text>
                <Text style={styles.ledgerAmount}>
                  {formatKRW(item.amount)}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => handleActionPress('ledger-go')}
              style={styles.remindButton}
            >
              <Text style={styles.remindButtonText}>증빙 바로가기</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    // bot-actions
    return (
      <View style={styles.botRow}>
        <Image
          source={require('../../assets/icons/nomal_hamco.png')}
          style={styles.botAvatar}
          resizeMode="contain"
        />
        <View style={styles.botCard}>
          <Text style={styles.botText}>{item.text}</Text>
          <View style={styles.actionList}>
            {item.actions.map(action => (
              <Pressable
                key={`${item.id}-${action.label}`}
                onPress={() => handleActionPress(action.action)}
                style={styles.actionButton}
              >
                <Text style={styles.actionButtonText}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.headerBack}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{groupName}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        style={{ flex: 1 }}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => {
          const last = messages[messages.length - 1];
          if (last?.type === 'chat' && last.senderId === userId) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
      />

      <View style={styles.inputWrap}>
        <TextInput
          value={msg}
          onChangeText={setMsg}
          placeholder="메시지를 입력하세요"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          multiline={false}
          blurOnSubmit={false}
          returnKeyType="send"
          autoCorrect={false}
          autoCapitalize="none"
          onSubmitEditing={handleSend}
        />
        <Pressable onPress={handleSend} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>➤</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  header: {
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBack: {
    fontSize: 28,
    color: '#111111',
    marginRight: 10,
    fontFamily: 'GmarketSansTTFMedium',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    color: '#1428A0',
    fontFamily: 'GmarketSansTTFBold',
  },
  listContent: { paddingHorizontal: 14, paddingTop: 18, paddingBottom: 16 },

  // ✅ userMessageRow, userBubble, userBubbleText 제거 (ChatMessage로 이동)

  botRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 18 },
  botAvatar: { width: 42, height: 42, marginRight: 8, marginBottom: 6 },
  botCard: {
    maxWidth: '82%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  botText: {
    color: '#444444',
    fontSize: 15,
    fontFamily: 'GmarketSansTTFBold',
    marginBottom: 12,
  },
  actionList: { gap: 10 },
  actionButton: {
    height: 40,
    borderWidth: 1.5,
    borderColor: '#8F8F8F',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
  },
  actionButtonText: {
    color: '#111111',
    fontSize: 15,
    fontFamily: 'GmarketSansTTFBold',
  },

  unpaidTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  unpaidTitlePrefix: {
    fontSize: 15,
    color: '#444444',
    fontFamily: 'GmarketSansTTFBold',
  },
  unpaidTitleCount: {
    fontSize: 15,
    color: '#FF1A0F',
    fontFamily: 'GmarketSansTTFBold',
  },
  unpaidMemberCard: {
    borderWidth: 1.5,
    borderColor: '#7A7A7A',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  unpaidMemberAvatar: { width: 48, height: 48, marginRight: 10 },
  unpaidMemberInfo: { flex: 1 },
  unpaidMemberName: {
    fontSize: 16,
    color: '#111111',
    fontFamily: 'GmarketSansTTFBold',
    marginBottom: 2,
  },
  unpaidMemberDate: {
    fontSize: 12,
    color: '#111111',
    fontFamily: 'GmarketSansTTFMedium',
  },

  ledgerInfoCard: {
    borderWidth: 1.5,
    borderColor: '#7A7A7A',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  ledgerDate: {
    fontSize: 16,
    color: '#111111',
    fontFamily: 'GmarketSansTTFBold',
    marginBottom: 10,
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ledgerType: {
    fontSize: 16,
    color: '#111111',
    fontFamily: 'GmarketSansTTFBold',
  },
  ledgerAmount: {
    fontSize: 22,
    color: '#FF1A0F',
    fontFamily: 'GmarketSansTTFBold',
  },

  remindButton: {
    marginTop: 12,
    height: 40,
    borderWidth: 1.5,
    borderColor: '#1F3FBF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  remindButtonText: {
    fontSize: 15,
    color: '#111111',
    fontFamily: 'GmarketSansTTFBold',
  },

  inputWrap: {
    marginHorizontal: 14,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    minHeight: 62,
    paddingLeft: 18,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#111111',
    paddingVertical: 0,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#3B6EF6',
    fontSize: 24,
    fontFamily: 'GmarketSansTTFBold',
  },
});
