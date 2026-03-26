import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import Text from '@/components/typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CommonParams } from '../../types/common';
import { images } from '@/types/images';
import { useChat } from '@/hooks/useChat';
import { useChatbot } from '@/hooks/useChatbot';
import { useAuthStore } from '@/store/useAuthStore';
import ChatInput from '@/components/groupChat/ChatInput';
import ChatMessageList from '@/components/groupChat/ChatMessageList';

const TEMP_IS_ADMIN = true;

export default function GroupChatScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const params = (route.params ?? {}) as CommonParams;

  const groupName = params.groupName ?? '회식주의자';
  const groupId = params.groupId;
  const isAdmin = TEMP_IS_ADMIN;
  const storeUserId = useAuthStore(s => s.userId);
  const userId = storeUserId ? Number(storeUserId) : 0;
  const [msg, setMsg] = useState('');

  const {
    messages,
    flatListRef,
    loadMoreMessages,
    appendChatItem,
    sendMessage,
    retryMessage,
    cancelMessage,
  } = useChat(String(groupId), userId);

  const { pickMode, handleHamcoTrigger, handleActionPress, sendPickMessage, exitPickMode } = useChatbot({
    isAdmin,
    userId,
    groupId: groupId,
    groupName,
    navigation,
    appendChatItem,
  });

  const handleSend = () => {
    const trimmed = msg.trim();
    if (!trimmed) return;

    // pick 모드에서는 chatbot API로 전송
    if (pickMode) {
      sendPickMessage(trimmed);
      setMsg('');
      return;
    }

    if (trimmed === '@햄코') {
      handleHamcoTrigger();
      setMsg('');
      return;
    }
    sendMessage(trimmed);
    setMsg('');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F0F4FF]" edges={['top']}>
      <View className="flex-row h-14 px-4 border-b border-b-[#D1D5DB] items-center">
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Image source={images.left_arrow} className="mr-3" />
        </Pressable>
        <Text weight="bold" className="flex-1 text-lg text-[#1428A0]">
          {groupName}
        </Text>
      </View>

      <ChatMessageList
        messages={messages}
        flatListRef={flatListRef}
        userId={userId}
        onRetry={retryMessage}
        onCancel={cancelMessage}
        onActionPress={handleActionPress}
        onLoadMore={loadMoreMessages}
      />

      {pickMode && (
        <View className="flex-row items-center justify-between px-4 py-2 bg-[#EEF2FF] border-t border-[#C7D2FE]">
          <Text weight="bold" className="text-sm text-[#1428A0]">
            🐹 햄코 PICK 모드
          </Text>
          <Pressable onPress={exitPickMode} hitSlop={12}>
            <Text className="text-sm text-[#6B7280]">✕ 종료</Text>
          </Pressable>
        </View>
      )}

      <ChatInput
        msg={msg}
        onChangeMsg={setMsg}
        onSend={handleSend}
        placeholder={pickMode ? '추천받고 싶은 내용을 입력하세요' : undefined}
      />
    </SafeAreaView>
  );
}