import { View, Text } from 'react-native';
import React from 'react';
import GroupSelectItem from '../../components/internet/GroupSelectItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/internet/Header';

export default function SelectGroupScreen() {
  const group = ['회식주의자', '14기 부울경 2반', '하이라디오 정모'];
  const insets = useSafeAreaInsets();
  return (
    <View
      className="p-4 flex-1 gap-4 bg-[#F0F4FF]"
      style={{ marginTop: insets.top }}
    >
      <Header title="모임 목록" />
      <View className="flex gap-2">
        {group.map(item => (
          <GroupSelectItem key={item} title={item} />
        ))}
      </View>
    </View>
  );
}
