// src/screens/group/GroupChatScreen.tsx
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { GroupParams } from '../../types/common';

export default function GroupChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as GroupParams;

  return (
    <ScreenLayout>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: '900' }}>
          커뮤니티(톡방) {params.groupName ? `- ${params.groupName}` : ''}
        </Text>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={{ fontSize: 16, fontWeight: '700' }}>닫기</Text>
        </Pressable>
      </View>

      <View style={{ marginTop: 16, borderRadius: 24, backgroundColor: '#E5E7EB', padding: 16 }}>
        <Text style={{ fontWeight: '800' }}>임시 톡방 화면</Text>
        <Text style={{ marginTop: 8 }}>- 실제 채팅은 다른 팀원 작업 범위</Text>
      </View>
    </ScreenLayout>
  );
}