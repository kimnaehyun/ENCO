// src/screens/admin/AdminReceiptScreen.tsx
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';

export default function AdminReceiptScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;

  return (
    <ScreenLayout>
      <View
        style={{
          height: 56,
          borderRadius: 12,
          backgroundColor: '#F3F4F6',
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '900' }}>증빙하기 - 영수증</Text>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={{ fontSize: 16, fontWeight: '800' }}>닫기</Text>
        </Pressable>
      </View>

      <View style={{ marginTop: 16, borderRadius: 24, backgroundColor: '#E5E7EB', padding: 16, gap: 10 }}>
        <Text style={{ fontWeight: '900' }}>{params.groupName ?? '모임명'}</Text>
        <Text>- TODO: 카메라 열기</Text>
        <Text>- TODO: 영수증 촬영 → OCR → 금액/가맹점/일시 자동 입력</Text>
        <Text>- 현재는 임시 페이지</Text>
      </View>

      <Pressable
        onPress={() => {}}
        style={{
          marginTop: 16,
          height: 52,
          borderRadius: 16,
          backgroundColor: '#D1D5DB',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontWeight: '900' }}>카메라 열기(임시)</Text>
      </Pressable>
    </ScreenLayout>
  );
}