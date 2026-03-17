// src/screens/group/SettleMemberSelectScreen.tsx
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';

type SettleMember = {
  id: string;
  name: string;
  isPaid: boolean;
};

type RouteParams = {
  amount: number;
  storeName: string;
  date: string;
  memo: string;
  receiptUri: string | null;
  groupName: string;
  groupId?: string;
  settleMembers?: SettleMember[];
  isNewSettle?: boolean; // true: OCR → 새 정산 등록 모드
};

// 그룹 전체 멤버 (임시 데이터)
const ALL_GROUP_MEMBERS: SettleMember[] = [
  { id: 'm1', name: '김싸피', isPaid: false },
  { id: 'm2', name: '고싸피', isPaid: false },
  { id: 'm3', name: '장싸피', isPaid: false },
  { id: 'm4', name: '정싸피', isPaid: false },
  { id: 'm5', name: '이싸피', isPaid: false },
];

export default function SettleMemberSelectScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as RouteParams;

  const { amount = 10000, groupName = '', isNewSettle = false } = params;

  // ── 새 정산 등록 모드 ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleMember = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === ALL_GROUP_MEMBERS.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(ALL_GROUP_MEMBERS.map(m => m.id)));
    }
  };

  const perPerson = selectedIds.size > 0 ? Math.ceil(amount / selectedIds.size) : 0;

  const handleRegister = () => {
    if (selectedIds.size === 0) {
      Alert.alert('안내', '정산할 인원을 선택하세요.');
      return;
    }

    const selectedMembers = ALL_GROUP_MEMBERS
      .filter(m => selectedIds.has(m.id))
      .map(m => ({ ...m, isPaid: false }));

    Alert.alert(
      '정산 등록',
      `${params.storeName}\n금액: ${amount.toLocaleString()}원\n인원: ${selectedIds.size}명 (1인당 ${perPerson.toLocaleString()}원)\n\n등록하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '등록',
          onPress: () => {
            // 등록 후 정산 플로우 스택을 정리하고 장부로 돌아감
            Alert.alert('완료', '새로운 정산이 등록되었습니다.', [
              {
                text: '확인',
                onPress: () => {
                  // OcrTest → SettleMemberSelect 스택을 모두 날리고 GroupLedger로
                  navigation.popToTop();
                  navigation.navigate('GroupLedger', { groupName });
                },
              },
            ]);
          },
        },
      ]
    );
  };

  // ── 기존 정산 조회 모드 (미납자 확인) ──
  const [members, setMembers] = useState<SettleMember[]>(
    params.settleMembers ?? [
      { id: 'm1', name: '김싸피', isPaid: true },
      { id: 'm2', name: '고싸피', isPaid: false },
      { id: 'm3', name: '장싸피', isPaid: true },
      { id: 'm4', name: '정싸피', isPaid: false },
    ]
  );

  const paidCount = members.filter(m => m.isPaid).length;
  const unpaidCount = members.filter(m => !m.isPaid).length;
  const existingPerPerson = members.length > 0 ? Math.ceil(amount / members.length) : 0;

  const onSendNotification = () => {
    const unpaidNames = members
      .filter(m => !m.isPaid)
      .map(m => m.name)
      .join(', ');

    if (unpaidCount === 0) {
      Alert.alert('안내', '모든 멤버가 납부 완료했습니다.');
      return;
    }

    Alert.alert(
      '미납자 알림 보내기',
      `${unpaidNames}에게 ${existingPerPerson.toLocaleString()}원 입금 요청 알림을 보냅니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '보내기',
          onPress: () => {
            Alert.alert('완료', `미납자 ${unpaidCount}명에게 알림을 보냈습니다.`);
          },
        },
      ]
    );
  };

  // ═══════════════════════════════════════
  // 새 정산 등록 모드 UI
  // ═══════════════════════════════════════
  if (isNewSettle) {
    return (
      <ScreenLayout>
        <View style={{ flex: 1 }}>

          {/* 헤더 */}
          <View className="flex-row items-center justify-between mb-5">
            <Text style={{ fontSize: 20, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}>
              정산 인원 선택
            </Text>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
              <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>닫기</Text>
            </Pressable>
          </View>

          {/* 정산 정보 요약 카드 */}
          <View
            className="bg-white rounded-3xl px-6 py-5 mb-5"
            style={{ shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 }}
          >
            <Text style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'GmarketSansTTFMedium', marginBottom: 4 }}>
              {params.date} · {params.storeName}
            </Text>
            <Text style={{ fontSize: 28, fontFamily: 'GmarketSansTTFBold', color: '#EF4444', textAlign: 'right' }}>
              -{amount.toLocaleString()}원
            </Text>
            {selectedIds.size > 0 && (
              <Text style={{ fontSize: 13, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium', textAlign: 'right', marginTop: 4 }}>
                1인당 {perPerson.toLocaleString()}원 · {selectedIds.size}명
              </Text>
            )}
          </View>

          {/* 전체 선택 */}
          <Pressable
            onPress={selectAll}
            className="flex-row items-center mb-4"
            style={{ gap: 8 }}
          >
            <View style={{
              width: 24, height: 24, borderRadius: 12,
              backgroundColor: selectedIds.size === ALL_GROUP_MEMBERS.length ? '#1428A0' : '#E5E7EB',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>✓</Text>
            </View>
            <Text style={{ fontSize: 15, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}>
              전체 선택
            </Text>
          </Pressable>

          {/* 멤버 리스트 */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
            style={{ flex: 1 }}
          >
            {ALL_GROUP_MEMBERS.map(m => {
              const isSelected = selectedIds.has(m.id);
              return (
                <Pressable
                  key={m.id}
                  onPress={() => toggleMember(m.id)}
                  className="flex-row items-center"
                  style={{ gap: 12 }}
                >
                  {/* 체크박스 */}
                  <View style={{
                    width: 24, height: 24, borderRadius: 12,
                    backgroundColor: isSelected ? '#1428A0' : '#E5E7EB',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>✓</Text>
                  </View>

                  {/* 아바타 */}
                  <View style={{
                    width: 48, height: 48, borderRadius: 24,
                    backgroundColor: isSelected ? '#EEF2FF' : '#F3F4F6',
                    borderWidth: 2,
                    borderColor: isSelected ? '#1428A0' : '#E5E7EB',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 22 }}>🐹</Text>
                  </View>

                  {/* 이름 */}
                  <Text style={{
                    fontSize: 16,
                    fontFamily: 'GmarketSansTTFBold',
                    color: isSelected ? '#111827' : '#9CA3AF',
                    flex: 1,
                  }}>
                    {m.name}
                  </Text>

                  {/* 1인당 금액 표시 */}
                  {isSelected && selectedIds.size > 0 && (
                    <Text style={{ fontSize: 14, color: '#1428A0', fontFamily: 'GmarketSansTTFBold' }}>
                      {perPerson.toLocaleString()}원
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* 하단 등록 버튼 */}
          <View style={{ paddingTop: 12, paddingBottom: 8 }}>
            <Pressable
              onPress={handleRegister}
              className="rounded-2xl py-4 items-center justify-center"
              style={{
                backgroundColor: selectedIds.size > 0 ? '#1428A0' : '#D1D5DB',
              }}
            >
              <Text style={{ fontSize: 16, color: '#fff', fontFamily: 'GmarketSansTTFBold' }}>
                {selectedIds.size > 0
                  ? `정산 등록하기 (${selectedIds.size}명)`
                  : '인원을 선택하세요'}
              </Text>
            </Pressable>
          </View>

        </View>
      </ScreenLayout>
    );
  }

  // ═══════════════════════════════════════
  // 기존 정산 조회 모드 UI (미납자 확인 + 알림)
  // ═══════════════════════════════════════
  return (
    <ScreenLayout>
      <View style={{ flex: 1 }}>

        {/* 헤더 */}
        <View className="flex-row items-center justify-between mb-5">
          <Text style={{ fontSize: 20, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}>
            정산 현황
          </Text>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>닫기</Text>
          </Pressable>
        </View>

        {/* 상태 요약 */}
        <View
          className="bg-white rounded-3xl px-6 py-5 mb-5"
          style={{ shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>
              총 정산 금액
            </Text>
            <Text style={{ fontSize: 22, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}>
              {amount.toLocaleString()}원
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>
              1인당
            </Text>
            <Text style={{ fontSize: 16, fontFamily: 'GmarketSansTTFBold', color: '#1428A0' }}>
              {existingPerPerson.toLocaleString()}원
            </Text>
          </View>
          <View className="h-px bg-gray-100 my-3" />
          <View className="flex-row items-center" style={{ gap: 16 }}>
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E' }} />
              <Text style={{ fontSize: 13, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>
                완료 {paidCount}명
              </Text>
            </View>
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444' }} />
              <Text style={{ fontSize: 13, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>
                미납 {unpaidCount}명
              </Text>
            </View>
          </View>
        </View>

        {/* 멤버 리스트 */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, gap: 16 }}
          style={{ flex: 1 }}
        >
          {/* 미납자 먼저 표시 */}
          {[...members].sort((a, b) => (a.isPaid === b.isPaid ? 0 : a.isPaid ? 1 : -1)).map(m => (
            <View
              key={m.id}
              className="flex-row items-center"
              style={{ gap: 12 }}
            >
              {/* 아바타 */}
              <View style={{
                width: 56, height: 56, borderRadius: 28,
                backgroundColor: m.isPaid ? '#F0FDF4' : '#FEF2F2',
                borderWidth: 2,
                borderColor: m.isPaid ? '#22C55E' : '#EF4444',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 28 }}>🐹</Text>
              </View>

              {/* 이름 */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}>
                  {m.name}
                </Text>
                <Text style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'GmarketSansTTFMedium', marginTop: 2 }}>
                  {existingPerPerson.toLocaleString()}원
                </Text>
              </View>

              {/* 상태 배지 */}
              <View style={{
                backgroundColor: m.isPaid ? '#22C55E' : '#EF4444',
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 6,
              }}>
                <Text style={{ fontSize: 13, color: '#fff', fontFamily: 'GmarketSansTTFBold' }}>
                  {m.isPaid ? '완료' : '미납'}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* 하단 미납자 알림 보내기 버튼 */}
        <View style={{ paddingTop: 12, paddingBottom: 8 }}>
          <Pressable
            onPress={onSendNotification}
            className="rounded-2xl py-4 items-center justify-center"
            style={{
              backgroundColor: unpaidCount > 0 ? '#EF4444' : '#D1D5DB',
            }}
          >
            <Text style={{ fontSize: 16, color: '#fff', fontFamily: 'GmarketSansTTFBold' }}>
              {unpaidCount > 0
                ? `미납자 ${unpaidCount}명에게 알림 보내기`
                : '전원 납부 완료'}
            </Text>
          </Pressable>
        </View>

      </View>
    </ScreenLayout>
  );
}