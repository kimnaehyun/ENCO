// src/screens/TogetherScreen.tsx
import React from 'react';
import { Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../components/ScreenLayout';
import { RootStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Text from '@/components/typography/Text';

export default function TogetherScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onPressCreateGroup = () => {
    navigation.navigate('GroupCreate');
  };

  return (
    <ScreenLayout>
      <Text variant="h2">모임 목록</Text>

      <Pressable
        onPress={onPressCreateGroup}
        className="mt-3 h-14 rounded-2xl bg-[#D1D5DB] justify-center items-center"
      >
        <Text weight="bold">+ 모임 만들기</Text>
      </Pressable>
    </ScreenLayout>
  );
}
