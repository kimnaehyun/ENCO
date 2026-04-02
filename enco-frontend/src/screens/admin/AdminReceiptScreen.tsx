// src/screens/admin/AdminReceiptScreen.tsx
import React from 'react';
import { Pressable, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';
import { GroupStackParamList } from '@/types/group';
import { NativeStackNavigationProp } from 'node_modules/@react-navigation/native-stack/lib/typescript/src/types';
import Text from '@/components/typography/Text';

type AdminReceiptRouteProp = RouteProp<GroupStackParamList, 'AdminReceipt'>;
type AdminReceiptNavigationProp = NativeStackNavigationProp<
  GroupStackParamList,
  'AdminReceipt'
>;

export default function AdminReceiptScreen() {
  const navigation = useNavigation<AdminReceiptNavigationProp>();
  const route = useRoute<AdminReceiptRouteProp>();
  const params = (route.params ?? {}) as CommonParams;

  return (
    <ScreenLayout>
      <View className="h-14 rounded-xl bg-[#F3F4F6] px-4 flex-row items-center justify-between">
        <Text variant="bodyLg" weight="bold">
          증빙하기 - 영수증
        </Text>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text weight="bold">닫기</Text>
        </Pressable>
      </View>

      <View className="mt-4 rounded-3xl bg-[#E5E7EB] p-4 gap-2.5">
        <Text weight="bold">{params.groupName ?? '모임명'}</Text>
        <Text>- TODO: 카메라 열기</Text>
        <Text>- TODO: 영수증 촬영 → OCR → 금액/가맹점/일시 자동 입력</Text>
        <Text>- 현재는 임시 페이지</Text>
      </View>

      <Pressable
        onPress={() => {}}
        className="mt-4 h-[52px] rounded-2xl bg-[#D1D5B] items-center justify-center"
      >
        <Text weight="bold">카메라 열기(임시)</Text>
      </Pressable>
    </ScreenLayout>
  );
}
