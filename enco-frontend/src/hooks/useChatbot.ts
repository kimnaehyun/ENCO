import { useState } from 'react';
import { ChatAction, ChatItem } from '@/types/chat';
import { askChatbot } from '@/services/chatService';

interface UseChatbotProps {
  isAdmin: boolean;
  userId: number;
  groupId: string | undefined;
  groupName: string;
  navigation: any;
  appendChatItem: (item: ChatItem) => void;
}

export function useChatbot({
  isAdmin,
  userId,
  groupId,
  groupName,
  navigation,
  appendChatItem,
}: UseChatbotProps) {
  const [pickMode, setPickMode] = useState(false);

  const getNowLabel = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const meridiem = hours < 12 ? '오전' : '오후';
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    return `${meridiem} ${displayHour}:${minutes}`;
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

  const handleHamcoTrigger = () => {
    appendChatItem({
      id: `user-${Date.now()}`,
      type: 'user',
      text: '@햄코',
      createdAt: getNowLabel(),
    });
    setTimeout(() => appendChatItem(buildHamcoActions()), 120);
  };

  // 햄코 PICK 모드에서 메시지 전송
  const sendPickMessage = async (message: string) => {
    if (!message.trim()) return;

    // 사용자 메시지를 채팅에 표시
    appendChatItem({
      id: `user-pick-${Date.now()}`,
      type: 'user',
      text: message,
      createdAt: getNowLabel(),
    });

    // 로딩 표시
    const loadingId = `bot-pick-loading-${Date.now()}`;
    appendChatItem({
      id: loadingId,
      type: 'chatbot',
      senderName: '햄코',
      senderImageUrl: '',
      content: '추천 결과를 찾고 있어요...',
      createdAt: getNowLabel(),
    });

    try {
      const roomId = String(groupId ?? '');
      console.log('[햄코PICK] 요청:', { roomId, senderId: userId, message });

      await askChatbot({
        roomId,
        senderId: userId,
        message: message.trim(),
      });

      // 응답은 WebSocket(CHATBOT_RESPONSE)으로 수신되므로
      // useChat의 subscribe에서 자동으로 messages에 추가됨
      // 로딩 메시지 제거는 WebSocket 응답이 오면 자연스럽게 밀려남

      console.log('[햄코PICK] 요청 전송 완료, WebSocket 응답 대기 중');
    } catch (err: any) {
      console.error('[햄코PICK] 요청 실패:', err?.response?.data ?? err);

      // 에러 시 안내 메시지
      appendChatItem({
        id: `bot-pick-error-${Date.now()}`,
        type: 'chatbot',
        senderName: '햄코',
        senderImageUrl: '',
        content: '추천 결과를 가져오지 못했어요. 다시 시도해주세요!',
        createdAt: getNowLabel(),
      });
    }
  };

  const handleActionPress = (action: ChatAction, label: string) => {
    appendChatItem({
      id: `user-${Date.now()}`,
      type: 'user',
      text: label,
      createdAt: getNowLabel(),
    });

    if (action === 'pay') {
      navigation.navigate('GroupPay', { groupId, groupName });
      return;
    }
    if (action === 'votes') {
      navigation.navigate('GroupVotes', { groupId, groupName });
      return;
    }
    if (action === 'admin') {
      navigation.navigate('AdminMenu', { groupId, groupName });
      return;
    }
    if (action === 'ledger-go') {
      navigation.navigate('GroupLedger', { groupId, groupName });
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
      setPickMode(true);
      appendChatItem({
        id: `bot-pick-guide-${Date.now()}`,
        type: 'chatbot',
        senderName: '햄코',
        senderImageUrl: '',
        content: '햄코 PICK 모드입니다! 🐹\n원하는 장소나 조건을 자유롭게 말씀해주세요.\n\n예) "부산에서 오션뷰이고 주차 가능한 숙소 추천해줘"',
        createdAt: getNowLabel(),
      });
    }
  };

  const exitPickMode = () => {
    setPickMode(false);
  };

  return {
    pickMode,
    handleHamcoTrigger,
    handleActionPress,
    sendPickMessage,
    exitPickMode,
  };
}