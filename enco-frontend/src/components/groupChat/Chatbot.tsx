import { View } from 'react-native'
import Text from '@/components/typography';;
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
            : require('../../assets/icons/CHATCO_icon.png')
        }
        className={botAvatar}
        resizeMode="contain"
      />
      <View className={botCard}>
        <Text weight="bold" className={botText} >
          {item.content}
        </Text>
      </View>
    </View>
  );
}
