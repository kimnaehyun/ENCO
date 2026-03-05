// src/screens/group/GroupPayScreen.tsx
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';

type Params = {
  groupId?: string;
  groupName?: string;
};

export default function GroupPayScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as Params;

  return (
    <ScreenLayout>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 20, fontWeight: '900' }}>
          납부 {params.groupName ? `- ${params.groupName}` : ''}
        </Text>

        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={{ fontSize: 16, fontWeight: '700' }}>닫기</Text>
        </Pressable>
      </View>

      <View
        style={{
          marginTop: 16,
          borderRadius: 24,
          backgroundColor: '#E5E7EB',
          padding: 16,
          gap: 10,
        }}
      >
        <Text style={{ fontWeight: '800' }}>임시 납부 페이지</Text>
        <Text>- 이번 달 회비: ₩10,000 (임시)</Text>
        <Text>- 납부 마감: 2026-03-31 (임시)</Text>
        <Text>- 버튼/결제 연동은 나중에</Text>
      </View>
    </ScreenLayout>
  );
}