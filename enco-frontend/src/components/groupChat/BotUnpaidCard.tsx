import { View, Image, Pressable, Alert } from 'react-native';
import Text from '@/components/typography';
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
          <Text weight="bold" className={unpaidTitlePrefix}>
            현재 미납 회원은{' '}
          </Text>
          <Text weight="bold" className={unpaidTitleCount}>
            {item.unpaidCount}명
          </Text>
          <Text weight="bold" className={unpaidTitlePrefix}>
            이에요!
          </Text>
        </View>

        {item.unpaidMembers.length === 0 ? (
          <View className="border border-[#7A7A7A] rounded-2xl p-3 bg-[#FFFFFF] items-center">
            <Text className="text-sm text-[#7A7A7A]">
              미납 회원이 없어요 🎉
            </Text>
          </View>
        ) : (
          item.unpaidMembers.map(
            (member: { name: string; unpaidAmount: number }) => (
              <View key={member.name} className="mb-2">
                <View className="border border-[#7A7A7A] rounded-2xl p-3 flex-row items-center bg-[#FFFFFF]">
                  <Image
                    source={require('../../assets/icons/nomal_hamco.png')}
                    className="w-12 h-12 mr-2.5"
                    resizeMode="contain"
                  />
                  <View className="flex-1">
                    <Text
                      weight="bold"
                      className="text-base text-[#111111] mb-0.5"
                    >
                      {member.name}
                    </Text>
                    <Text className="text-xs text-[#111111]">
                      미납 금액 {member.unpaidAmount.toLocaleString()}원
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => handleSendReminder(member.name)}
                  className={remindButton}
                >
                  <Text weight="bold" className={remindButtonText}>
                    알림 보내기
                  </Text>
                </Pressable>
              </View>
            ),
          )
        )}
      </View>
    </View>
  );
}
