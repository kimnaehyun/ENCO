import { View, Text } from 'react-native';
import React from 'react';
import GroupSelectItem from '../../components/internet/GroupSelectItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SelectGroupScreen() {
  const group = ['회식주의자', '14기 부울경 2반', '하이라디오 정모'];
  const insets = useSafeAreaInsets();
  return (
    <View
      className="bg-[#F3F4F6] p-4 flex gap-4"
      style={{ marginTop: insets.top }}
    >
      <View className="bg-white py-4 pl-8 rounded-[20px]">
        <Text className="font-bold text-xl">모임 목록</Text>
      </View>
      <View className="flex gap-2">
        {group.map(item => (
          <GroupSelectItem key={item} title={item} />
        ))}
      </View>
    </View>
  );
}
