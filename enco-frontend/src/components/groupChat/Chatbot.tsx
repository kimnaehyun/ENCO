import { View, Text } from 'react-native';
import React from 'react';
import {
  botAvatar,
  botCard,
  botRow,
  botText,
} from '@/assets/styles/chatStyles';
import { Image } from 'react-native';

export default function Chatbot({ item }: { item: any }) {
  return (
    <View className={botRow}>
      <Image
        source={
          item.senderImageUrl
            ? { uri: item.senderImageUrl }
            : require('../../assets/icons/nomal_hamco.png')
        }
        className={botAvatar}
        resizeMode="contain"
      />
      <View className={botCard}>
        <Text className={botText} style={{ fontFamily: 'GmarketSansTTFBold' }}>
          {item.content}
        </Text>
      </View>
    </View>
  );
}
