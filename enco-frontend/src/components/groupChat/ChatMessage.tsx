// src/components/groupChat/ChatMessage.tsx
import { View, Text, Image } from 'react-native';
import React from 'react';
import { images } from '../../types/images';
import { ChatMsgProps } from '../../types/chat';

export default function ChatMessage({
  content,
  host,
  isMe,
  created_at,
}: ChatMsgProps) {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  if (isMe) {
    return (
      <View className="flex items-end px-2 my-1">
        <View className="flex flex-row items-end">
          {/* 시간 왼쪽 */}
          <Text className="text-xs text-gray-400 mr-1">
            {formatTime(created_at)}
          </Text>
          {/* 메시지 */}
          <View className="max-w-[75%]">
            <Text className="rounded-lg p-3 bg-[#fef01b]">{content}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex items-start px-2 my-1">
      <View className="flex flex-row items-end">
        <Image
          className="w-12 h-12 rounded-full flex-shrink-0 self-start"
          source={images.user}
        />
        {/* 메시지 */}
        <View className="max-w-[75%]">
          <Text>{host}</Text>
          <Text className="rounded-lg p-3 bg-[#ffffff]">{content}</Text>
        </View>
        {/* 시간 오른쪽 */}
        <Text className="text-xs text-gray-400 ml-1">
          {formatTime(created_at)}
        </Text>
      </View>
    </View>
  );
}
