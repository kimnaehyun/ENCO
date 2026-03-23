import { FlatList } from 'react-native';

type ChatMsgProps = {
  content: string;
  senderId: number;
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

// API 응답의 단일 메시지 형태
type ApiMessage = {
  messageId: string;
  type: 'CHAT' | 'CHATBOT_RESPONSE' | string;
  roomId: number;
  senderName: string;
  senderImageUrl: string;
  content: string;
  createdAt: string;
  // CHAT 타입에만 존재할 수 있는 필드
  senderId?: number;
  metadata?: null;
  messageType?: string;
};

export interface ChatMessageListProps {
  messages: ChatItem[];
  flatListRef: React.RefObject<FlatList<ChatItem> | null>;
  userId: number;
  onRetry: (id: string, content: string) => void;
  onCancel: (id: string) => void;
  onActionPress: (action: ChatAction, label: string) => void;
  onLoadMore: () => void;
}

export type { ChatMsgProps, ChatAction, ChatItem, ApiMessage };
