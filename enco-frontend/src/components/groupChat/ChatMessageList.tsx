import { FlatList, ListRenderItem } from 'react-native';
import { ChatItem, ChatMessageListProps } from '@/types/chat';
import ChatMessage from '@/components/groupChat/ChatMessage';
import Chatbot from '@/components/groupChat/Chatbot';
import BotUnpaidCard from '@/components/groupChat/BotUnpaidCard';
import BotActions from '@/components/groupChat/BotActions';
import BotLedgerCard from '@/components/groupChat/BotLedGerCard';

export default function ChatMessageList({
  messages,
  flatListRef,
  userId,
  onRetry,
  onCancel,
  onActionPress,
  onLoadMore,
}: ChatMessageListProps) {
  const renderItem: ListRenderItem<ChatItem> = ({ item }) => {
    if (item.type === 'chat') {
      return (
        <ChatMessage
          key={item.id}
          content={item.content}
          senderId={item.senderId}
          isMe={item.senderId === userId}
          created_at={item.createdAt}
          status={item.status}
          onRetry={() => onRetry(item.id, item.content)}
          onCancel={() => onCancel(item.id)}
        />
      );
    }
    if (item.type === 'chatbot') {
      return <Chatbot key={item.id} item={item} />;
    }
    if (item.type === 'user') {
      return (
        <ChatMessage
          key={item.id}
          content={item.text}
          senderId={userId}
          isMe={true}
          created_at={item.createdAt}
          status="sent"
        />
      );
    }
    if (item.type === 'bot-unpaid-card') {
      return <BotUnpaidCard key={item.id} item={item} />;
    }
    if (item.type === 'bot-ledger-card') {
      return (
        <BotLedgerCard
          key={item.id}
          item={item}
          onPress={() => onActionPress('ledger-go', '장부 관리하기')}
        />
      );
    }
    return (
      <BotActions
        key={item.id}
        item={item}
        onPress={(action, label) => onActionPress(action, label)}
      />
    );
  };

  return (
    <FlatList
      className="flex-1 p-4"
      ref={flatListRef}
      data={messages}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      onEndReachedThreshold={0.1}
      onScrollToIndexFailed={() => {}}
      onRefresh={onLoadMore}
      refreshing={false}
      onContentSizeChange={() => {
        const last = messages[messages.length - 1];
        if (last?.type === 'chat' && last.senderId === userId) {
          flatListRef.current?.scrollToEnd({ animated: true });
        }
      }}
    />
  );
}
