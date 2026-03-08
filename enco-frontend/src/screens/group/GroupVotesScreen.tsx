// src/screens/group/GroupVotesScreen.tsx
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { GroupParams } from '../../types/common';

export default function GroupVotesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as GroupParams;

  return (
    <ScreenLayout>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 20, fontWeight: '900' }}>
          투표 목록 {params.groupName ? `- ${params.groupName}` : ''}
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
        <Text style={{ fontWeight: '800' }}>임시 투표 리스트</Text>
        <Text>- 1위: 오늘 회식 장소 정하기</Text>
        <Text>- 2위: 다음 모임 날짜 투표</Text>
        <Text>- 3위: 회비 인상 여부</Text>
      </View>
    </ScreenLayout>
  );
}