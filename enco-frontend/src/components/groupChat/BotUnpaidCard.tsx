import { View, Text, Image, Pressable, Alert } from 'react-native';
import React from 'react';
import {
  botAvatar,
  botCard,
  botRow,
  remindButton,
  remindButtonText,
  unpaidTitleCount,
  unpaidTitlePrefix,
  unpaidTitleRow,
} from '@/assets/styles/chatStyles';

export default function BotUnpaidCard({ item }: { item: any }) {
  const handleSendReminder = (memberName: string) => {
    Alert.alert('알림', `${memberName}님에게 미납 알림을 보냈습니다. (임시)`);
  };
  return (
    <View className={botRow}>
      <Image
        source={require('../../assets/icons/nomal_hamco.png')}
        className={botAvatar}
        resizeMode="contain"
      />
      <View className={botCard}>
        <View className={unpaidTitleRow}>
          <Text
            className={unpaidTitlePrefix}
            style={{ fontFamily: 'GmarketSansTTFBold' }}
          >
            현재 미납 회원은{' '}
          </Text>
          <Text
            className={unpaidTitleCount}
            style={{ fontFamily: 'GmarketSansTTFBold' }}
          >
            {item.unpaidCount}명
          </Text>
          <Text
            className={unpaidTitlePrefix}
            style={{ fontFamily: 'GmarketSansTTFBold' }}
          >
            이에요!
          </Text>
        </View>
        <View className="border border-[#7A7A7A] rounded-2xl p-3 flex-row items-center bg-[#FFFFFF]">
          <Image
            source={require('../../assets/icons/nomal_hamco.png')}
            className="w-12 h-12 mr-2.5"
            resizeMode="contain"
          />
          <View className="flex-1">
            <Text
              className="text-base text-[#111111] mb-0.5"
              style={{ fontFamily: 'GmarketSansTTFBold' }}
            >
              {item.memberName}
            </Text>
            <Text
              className="text-xs text-[#111111]"
              style={{ fontFamily: 'GmarketSansTTFMedium' }}
            >
              마지막 납입일 {item.lastPaidAt}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => handleSendReminder(item.memberName)}
          className={remindButton}
        >
          <Text
            className={remindButtonText}
            style={{ fontFamily: 'GmarketSansTTFBold' }}
          >
            알림 보내기
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
