type ChatMsgProps = {
  content: string;
  senderId: number;
  isMe: boolean;
  created_at: string;
  status?: 'sending' | 'sent' | 'failed';
  onRetry?: () => void;
  onCancel?: () => void;
};

export type { ChatMsgProps };
