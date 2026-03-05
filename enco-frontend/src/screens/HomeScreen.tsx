// scr/screens/HomeScreen.tsx
// 로그인 완료 가정 -> 로그인 상태에 따라 화면이 달라지는 경우는 추후 구현
// 사용자가 가입한 모임이 있다고 가정하고 임시 페이지 제작

import React from 'react';
import {Image, Pressable, Text, View } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { ROUTES } from '../navigation/routes';

import ScreenLayout from '../components/ScreenLayout';
// 로그인
import { useAuthStore } from "../store/useAuthStore";
import { use } from "react";

type GroupSummary = {
  id: string;
  name: string;
  coverImage?: any; // 일단 로컬도 require도 가능하게 any
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  // UI 완성용 하드 코딩
  const me = {displayName: '나기'};
  const groups : GroupSummary[] = [
    {
      id: 'g1',
      name: '회식주의자',
      coverImage: require('../assets/images/group1.png'),
    }
  ];

  const hasGroup = groups.length > 0;
  const firstGroup = groups[0];

  const onPressGroupCard = () => {
    const groupId = 'g1';
    const groupName = '회식주의자';

    navigation.navigate(ROUTES.TAB_GROUP as any, {
      screen: 'GroupDashboard',
      params: { groupId, groupName },
    });
  };
  
  return(
    <ScreenLayout>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: '#E5E7EB',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* 아바타 이미지 나중에 붙이면 됨 */}
          <Text>🙂</Text>
        </View>

        <Text style={{ fontSize: 22, fontWeight: '700' }}>
          {me.displayName ? `${me.displayName}님 환영합니다` : '님 환영합니다'}
        </Text>
      </View>

      {/* Group Card */}
      <View style={{ marginTop: 24 }}>
        {hasGroup ? (
          <Pressable
            onPress={onPressGroupCard}
            style={{
              height: 180,
              borderRadius: 16,
              backgroundColor: '#D1D5DB',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* 지금은 이미지 대신 텍스트로 */}
            <Text style={{ fontSize: 18, fontWeight: '600' }}>{firstGroup.name} 모임통장</Text>
            <Text style={{ marginTop: 8, color: '#374151' }}>눌러서 대시보드로 이동</Text>
          </Pressable>
        ) : (
          <View
            style={{
              height: 180,
              borderRadius: 16,
              backgroundColor: '#E5E7EB',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600' }}>모임이 없습니다</Text>
            <Text style={{ marginTop: 8, color: '#6B7280' }}>모임을 개설해보세요</Text>
          </View>
        )}
      </View>

      {/* 안내 텍스트(와이어프레임의 스와이프 힌트 같은 것) */}
      <Text style={{ marginTop: 16, textAlign: 'center', color: '#6B7280' }}>
        상하/좌우로 스와이프
      </Text>
    </ScreenLayout>
  );
}