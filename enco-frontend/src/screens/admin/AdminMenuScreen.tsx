// src/screens/admin/AdminMenuScreen.tsx
import React from 'react';
import { Alert, Pressable, View } from 'react-native';
import Text from '@/components/typography';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';
import { AdminMenuItem } from '../../types/admin';
import { GroupStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from 'node_modules/@react-navigation/native-stack/lib/typescript/src/types';

type AdminMenuRouteProp = RouteProp<GroupStackParamList, 'AdminMenu'>;
type AdminMenuNavigationProp = NativeStackNavigationProp<
  GroupStackParamList,
  'AdminMenu'
>;

export default function AdminMenuScreen() {
  const navigation = useNavigation<AdminMenuNavigationProp>();
  const route = useRoute<AdminMenuRouteProp>();
  const params = (route.params ?? {}) as CommonParams;

  const menus: AdminMenuItem[] = [
    {
      key: 'alertMember',
      title: '미납자 알림 보내기',
      onPress: () =>
        navigation.navigate('AdminSendAlert', {
          groupId: params.groupId,
          groupName: params.groupName,
        }),
    },
    {
      key: 'groupInfo',
      title: '모임 정보',
      onPress: () =>
        navigation.navigate('GroupInfo', {
          groupId: params.groupId,
          groupName: params.groupName,
          isAdmin: true,
        }),
    },
    {
      key: 'ledger',
      title: '모임 장부',
      onPress: () =>
        navigation.navigate('GroupLedger', {
          groupId: params.groupId,
          groupName: params.groupName,
          isAdmin: true,
        }),
    },
    {
      key: 'member',
      title: '멤버 관리',
      onPress: () =>
        navigation.navigate('AdminMembers', {
          groupId: params.groupId,
          groupName: params.groupName,
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

  const onPressDissolve = () => {
    Alert.alert('모임 해산하기', '정말로 모임을 해산하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '해산',
        style: 'destructive',
        onPress: () => navigation.popToTop(),
      },
    ]);
  };

  return (
    <ScreenLayout>
      <View className="flex-1">
        {/* 헤더 */}
        <View className="rounded-3xl px-6 py-4 mb-6 items-start justify-center bg-[#1428A0] ">
          <Text variant="bodyLg" weight="bold" color="white">
            모임 관리
          </Text>
        </View>

        {/* 메뉴 리스트 */}
        <View className="gap-3 flex-1">
          {menus.map(m => (
            <Pressable
              key={m.key}
              onPress={m.onPress}
              hitSlop={8}
              className="bg-white rounded-3xl px-6 justify-center h-[72px]"
              style={{
                shadowColor: '#1428A0',
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 1,
              }}
            >
              <Text variant="bodyLg" weight="bold" color="dark">
                {m.title}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 모임 해산하기 */}
        <Pressable
          onPress={onPressDissolve}
          className="rounded-3xl items-center justify-center mt-6 mb-8 h-14 bg-[#FFBDBD]"
        >
          <Text weight="bold" color="#C0392B">
            모임 해산하기
          </Text>
        </Pressable>
      </View>
    </ScreenLayout>
  );
}
