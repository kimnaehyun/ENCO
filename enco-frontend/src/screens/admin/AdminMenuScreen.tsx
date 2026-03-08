// src/screens/admin/AdminMenuScreen.tsx
import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';

type Params = {
  groupId?: string;
  groupName?: string;
};

type MenuItem = {
  key: string;
  title: string;
  onPress: () => void;
};

export default function AdminMenuScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as Params;

  const groupName = params.groupName ?? '관리자 페이지';

  // ✅ "이미 만든 페이지"는 연결, 없으면 placeholder로 연결(다음 단계에서 만들 예정)
  const menus: MenuItem[] = [
    {
      key: 'settle',
      title: '정산하기 - 미납자 관리, 입출금',
      onPress: () =>
        navigation.navigate('AdminSettle', { 
          groupId: params.groupId, 
          groupName: params.groupName 
        }),
    },
    {
      key: 'vote',
      title: '투표 제의하기',
      onPress: () =>
        navigation.navigate('GroupVoteCreate', {
          groupId: params.groupId,
          groupName: params.groupName,
        }),
    },
    {
      key: 'receipt',
      title: '증빙하기 - 영수증',
      onPress: () =>
        navigation.navigate('AdminReceipt', {
          groupId: params.groupId,
          groupName: params.groupName,
        }),
    },
    {
      key: 'member',
      title: '멤버관리 - 추방, 초대',
      onPress: () =>
        navigation.navigate('AdminMembers', {
          groupId: params.groupId,
          groupName: params.groupName,
        }),
    },
    {
      key: 'groupSetting',
      title: '모임 설정',
      onPress: () =>
        navigation.navigate('GroupInfo', {
          groupId: params.groupId,
          groupName: params.groupName,
          isAdmin: true,
        }),
    },
    {
      key: 'card',
      title: '카드 추가 발급',
      onPress: () =>
        navigation.navigate('AdminCard', {
          groupId: params.groupId,
          groupName: params.groupName,
        }),
    },
  ];

  return (
    <ScreenLayout>
      {/* Header */}
      <View style={styles.headerPill}>
        <Text style={styles.headerText}>{groupName}</Text>
      </View>

      <View style={{ marginTop: 14, gap: 14 }}>
        {menus.map(m => (
          <Pressable key={m.key} onPress={m.onPress} style={styles.menuBtn} hitSlop={10}>
            <Text style={styles.menuText}>{m.title}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 18 }} hitSlop={12}>
        <Text style={{ textAlign: 'center', fontWeight: '800' }}>닫기</Text>
      </Pressable>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerPill: {
    backgroundColor: '#D9D9D9',
    borderRadius: 26,
    paddingVertical: 14,
    alignItems: 'center',
  },
  headerText: { fontSize: 18, fontWeight: '800' },

  menuBtn: {
    backgroundColor: '#D9D9D9',
    borderRadius: 26,
    paddingVertical: 18,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  menuText: { fontSize: 16, fontWeight: '800' },
});