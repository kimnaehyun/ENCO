// src/screens/TogetherScreen.tsx
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../components/ScreenLayout';

export default function TogetherScreen() {
  const navigation = useNavigation<any>();

  // ✅ 임시 모임 1개 (나중에 API/스토어로 교체)
  const group = { id: 'g1', name: '회식주의자' };

  const onPressGroup = () => {
    navigation.navigate('GroupDashboard', {
      groupId: group.id,
      groupName: group.name,
    });
  };

  return (
    <ScreenLayout>
      <Text style={{ fontSize: 22, fontWeight: '800' }}>모임 목록</Text>

      <Pressable
        onPress={onPressGroup}
        style={{
          marginTop: 16,
          height: 120,
          borderRadius: 16,
          backgroundColor: '#E5E7EB',
          padding: 16,
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '700' }}>{group.name}</Text>
        <Text style={{ marginTop: 6, color: '#6B7280' }}>
          눌러서 모임 대시보드로 이동
        </Text>
      </Pressable>
    </ScreenLayout>
  );
}