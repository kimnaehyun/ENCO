// src/screens/group/GroupInfoScreen.tsx
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';

function SectionCard({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <View
      style={{
        marginTop: 14,
        borderRadius: 24,
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 18,
        paddingVertical: 18,
        minHeight: 74,
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '800', marginBottom: 8 }}>{title}</Text>
      {children}
    </View>
  );
}

export default function GroupInfoScreen() {
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;
  const navigation = useNavigation<any>();
  const groupName = params.groupName ?? '모임명';

  // ✅ 임시 데이터 (나중에 API/스토어로 교체, 관리자만 수정 가능하게 확장)
  const info = {
    intro: '모임 소개(임시)\n- 간단한 소개 문장을 여기에 표시',
    purpose: '목적(임시)\n- 예: 회식/스터디/여행 준비',
    createdAt: '모임 개설일(임시)\n- 2026-03-05',
    dues: '회비(임시)\n- 월 10,000원 / 매월 5일',
    groundRules:
      '그라운드룰(임시)\n- 정산은 모임 후 24시간 내\n- 지출은 영수증 첨부\n- 미납 시 자동 알림\n- 투표로 결제 승인',
  };

  return (
    <ScreenLayout>
      {/* Header */}
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


        <Text 
          numberOfLines={1}
          style={{ fontSize: 20, fontWeight: '900', flex: 1, paddingRight: 12 }}>
            {groupName}
            </Text>

        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={{ fontSize: 16, fontWeight: '800' }}>닫기</Text>
        </Pressable>

      </View>

      {/* Sections */}
      <SectionCard title="모임소개">
        <Text style={{ color: '#374151', lineHeight: 20 }}>{info.intro}</Text>
      </SectionCard>

      <SectionCard title="목적">
        <Text style={{ color: '#374151', lineHeight: 20 }}>{info.purpose}</Text>
      </SectionCard>

      <SectionCard title="모임 개설일">
        <Text style={{ color: '#374151', lineHeight: 20 }}>{info.createdAt}</Text>
      </SectionCard>

      <SectionCard title="회비">
        <Text style={{ color: '#374151', lineHeight: 20 }}>{info.dues}</Text>
      </SectionCard>

      <View
        style={{
          marginTop: 14,
          borderRadius: 24,
          backgroundColor: '#E5E7EB',
          paddingHorizontal: 18,
          paddingVertical: 18,
          minHeight: 150,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '800', marginBottom: 8 }}>그라운드룰</Text>
        <Text style={{ color: '#374151', lineHeight: 20 }}>{info.groundRules}</Text>
      </View>
    </ScreenLayout>
  );
}