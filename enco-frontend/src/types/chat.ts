import { FlatList } from 'react-native';

type ChatMsgProps = {
  content: string;
  senderId: number;
  senderName?: string;
  senderProfileImage?: number;
  senderImageUrl?: string;
  isMe: boolean;
  created_at: string;
  status?: 'sending' | 'sent' | 'failed';
  onRetry?: () => void;
  onCancel?: () => void;
};

type ChatAction =
  | 'pay'
  | 'notice'
  | 'votes'
  | 'pick'
  | 'settlement'
  | 'deferred-settlement'
  | 'admin'
  | 'ledger-unproof'
  | 'ledger-go';

type ChatItem =
  | {
      id: string;
      type: 'chat';
      senderId: number;
      senderName?: string;
      senderImageUrl?: string;
      senderProfileImage?: number;
      content: string;
      createdAt: string;
      status: 'sending' | 'sent' | 'failed';
      metadata: null;
      roomId: string;
      messageType: string;
    }
  | {
      id: string;
      type: 'chatbot'; // 서버에서 오는 CHATBOT_RESPONSE 타입
      senderName: string;
      senderImageUrl: string;
      content: string;
      createdAt: string;
    }
  | {
      id: string;
      type: 'user'; // 챗봇 트리거 메시지 (@햄코 등 로컬 전용)
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
      groupId: number; // 추가
      unpaidMembers: { userId: number; name: string; unpaidAmount: number }[]; // userId 추가
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

// API 응답의 단일 메시지 형태
// 서버는 messageType/id를 사용하지만, 일부 레거시 응답은 type/messageId를 사용
type ApiMessage = {
  // 서버 실제 필드
  id?: string;
  messageType?: 'CHAT' | 'BOT_QUESTION' | 'BOT_ANSWER' | 'SYSTEM' | string;
  roomId: number | string;
  senderId?: number;
  content: string;
  metadata?: null | Record<string, any>;
  createdAt: string;
  // 레거시 호환 필드
  messageId?: string;
  type?: 'CHAT' | 'CHATBOT_RESPONSE' | string;
  senderName?: string;
  senderImageUrl?: string;
  senderProfileImage?: number;
};

export interface ChatMessageListProps {
  messages: ChatItem[];
  flatListRef: React.RefObject<FlatList<ChatItem> | null>;
  userId: number;
  onRetry: (id: string, content: string) => void;
  onCancel: (id: string) => void;
  onActionPress: (action: ChatAction, label: string) => void;
  onLoadMore: () => void;
  isLoadingOlderRef: React.RefObject<boolean>;
}

type BotUnpaidCardItem = Extract<ChatItem, { type: 'bot-unpaid-card' }>;
type BotLedgerCardItem = Extract<ChatItem, { type: 'bot-ledger-card' }>;
type ChatbotItem = Extract<ChatItem, { type: 'chatbot' }>;
type BotActionsItem = Extract<ChatItem, { type: 'bot-actions' }>;

export type {
  ChatMsgProps,
  ChatAction,
  ChatItem,
  ApiMessage,
  BotActionsItem,
  BotUnpaidCardItem,
  BotLedgerCardItem,
  ChatbotItem,
};
