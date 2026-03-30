import { useRef } from 'react';
import { FlatList, ListRenderItem, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { ChatItem, ChatMessageListProps } from '@/types/chat';
import ChatMessage from '@/components/groupChat/ChatMessage';
import Chatbot from '@/components/groupChat/Chatbot';
import BotUnpaidCard from '@/components/groupChat/BotUnpaidCard';
import BotActions from '@/components/groupChat/BotActions';
import BotLedgerCard from '@/components/groupChat/BotLedGerCard';

const AUTO_SCROLL_THRESHOLD = 80;

export default function ChatMessageList({
  messages,
  flatListRef,
  userId,
  onRetry,
  onCancel,
  onActionPress,
  onLoadMore,
  isLoadingOlderRef,
}: ChatMessageListProps) {
  const isNearBottomRef = useRef(true);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom =
      contentSize.height - (contentOffset.y + layoutMeasurement.height);
    isNearBottomRef.current = distanceFromBottom <= AUTO_SCROLL_THRESHOLD;
  };

  const renderItem: ListRenderItem<ChatItem> = ({ item }) => {
    console.log(item);

    if (item.type === 'chat') {
      return (
        <ChatMessage
          key={item.id}
          content={item.content}
          senderId={item.senderId}
          senderName={item.senderName}
          senderProfileImage={item.senderProfileImage}
          senderImageUrl={item.senderImageUrl}
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
      onScroll={handleScroll}
      scrollEventThrottle={16}
      onContentSizeChange={() => {
        if (isLoadingOlderRef.current) {
          return;
        }

        const last = messages[messages.length - 1];
        const isOutgoingChat = last?.type === 'chat' && last.senderId === userId;
        const isBotMessage =
          last?.type === 'chatbot' ||
          last?.type === 'bot-actions' ||
          last?.type === 'bot-unpaid-card' ||
          last?.type === 'bot-ledger-card';
        // 챗봇/시스템 카드나 내가 보낸 메시지일 때만 하단 이동 후보
        const shouldScroll = isOutgoingChat || last?.type === 'user' || isBotMessage;

        if (!shouldScroll) {
          return;
        }

        // 챗봇 메시지는 항상 스크롤, 일반 메시지는 사용자가 아래쪽에 있을 때만 스크롤
        if (!isBotMessage && !isNearBottomRef.current && !isOutgoingChat) {
          return;
        }

        if (flatListRef.current) {
          flatListRef.current?.scrollToEnd({ animated: true });
        }
      }}
    />
  );
}
