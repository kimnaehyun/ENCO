import { View } from 'react-native';
import React from 'react';
import GroupSelectItem from '../../components/internet/GroupSelectItem';
import Header from '../../components/internet/Header';
import ScreenLayout from '../../components/ScreenLayout';

export default function SelectGroupScreen() {
  const group = ['회식주의자', '14기 부울경 2반', '하이라디오 정모'];

  return (
    <ScreenLayout className="gap-4">
      <Header title="모임 목록" />
      <View className="flex gap-2">
        {group.map(item => (
          <GroupSelectItem key={item} title={item} />
        ))}
      </View>
    </ScreenLayout>
  );
}
