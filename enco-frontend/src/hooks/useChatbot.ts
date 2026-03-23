import { ChatAction, ChatItem } from '@/types/chat';

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

  return {
    handleHamcoTrigger,
    handleActionPress,
  };
}
