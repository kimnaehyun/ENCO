// src/screens/TogetherScreen.tsx
import React from 'react';
import { Pressable, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../components/ScreenLayout';
import { RootStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function TogetherScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onPressCreateGroup = () => {
    navigation.navigate('GroupCreate');
  };

  return (
    <ScreenLayout>
      <Text style={{ fontSize: 22, fontWeight: '800' }}>모임 목록</Text>

      <Pressable
        onPress={onPressCreateGroup}
        style={{
          marginTop: 12,
          height: 56,
          borderRadius: 16,
          backgroundColor: '#D1D5DB',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '700' }}>+ 모임 만들기</Text>
      </Pressable>
    </ScreenLayout>
  );
}
