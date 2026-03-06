// src/screens/group/GroupLedgerScreen.tsx
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';

type Params = {
  groupId?: string;
  groupName?: string;
};

type LedgerItem = {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // + / -
  title: string;
  memo?: string;
  hasReceipt?: boolean;
};

function formatMoney(n: number) {
  const sign = n >= 0 ? '+' : '-';
  const abs = Math.abs(n);
  return `${sign}₩ ${abs.toLocaleString()}`;
}

export default function GroupLedgerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as Params;

  const groupName = params.groupName ?? '모임명';

  // ✅ 임시 데이터
  const items: LedgerItem[] = useMemo(
    () => [
      { id: 'l1', date: '2026-03-06', amount: +10000, title: '회비 입금', memo: '3월 회비', hasReceipt: false },
      { id: 'l2', date: '2026-03-06', amount: -58000, title: '회식 결제', memo: '강남 ○○식당', hasReceipt: true },
      { id: 'l3', date: '2026-03-05', amount: -12000, title: '간식 결제', memo: '편의점', hasReceipt: true },
      { id: 'l4', date: '2026-03-03', amount: -25000, title: '장소 대관', memo: '스터디룸 2시간', hasReceipt: false },
    ],
    []
  );

  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const onPressFilter = () => {
    Alert.alert('필터', 'TODO: 연간/월별, 기간, 정렬, 사용자별 필터 UI');
  };

  const onPressStartDate = () => {
    Alert.alert('조회 시작 기간', 'TODO: 날짜 선택 모달');
  };

  const onPressEndDate = () => {
    Alert.alert('조회 마감 기간', 'TODO: 날짜 선택 모달');
  };

  const onPressExport = () => {
    const selected = Object.entries(selectedIds)
      .filter(([, v]) => v)
      .map(([k]) => k);

    Alert.alert(
      '내보내기',
      selected.length === 0
        ? '선택된 항목이 없습니다. 체크 후 내보내기를 눌러주세요.'
        : `선택된 항목 ${selected.length}개를 PDF로 내보내기(임시)`
    );
  };

  return (
    <ScreenLayout>
      {/* Header: 좌측 타이틀 / 우측 닫기 */}
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
        <Text numberOfLines={1} style={{ fontSize: 20, fontWeight: '900', flex: 1, paddingRight: 12 }}>
          장부
        </Text>

        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={{ fontSize: 16, fontWeight: '800' }}>닫기</Text>
        </Pressable>
      </View>

      <ScrollView style={{ marginTop: 12 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* 안내/기능 설명 + 버튼(필터/내보내기) */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '800', marginBottom: 6 }}>{groupName}</Text>
            <Text style={{ lineHeight: 20 }}>• 연간 / 월별</Text>
            <Text style={{ lineHeight: 20 }}>• 기간, 사용자별</Text>
            <Text style={{ lineHeight: 20 }}>• 정렬: 최신순/오래된 순서</Text>
            <Text style={{ lineHeight: 20 }}>• 눌렀을 때 상세 정보</Text>
          </View>

          <View style={{ justifyContent: 'flex-start', gap: 10 }}>
            <Pressable
              onPress={onPressFilter}
              hitSlop={10}
              style={{
                minWidth: 92,
                height: 44,
                borderRadius: 12,
                backgroundColor: '#E5E7EB',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontWeight: '800' }}>필터</Text>
            </Pressable>

            <Pressable
              onPress={onPressExport}
              hitSlop={10}
              style={{
                minWidth: 92,
                height: 44,
                borderRadius: 12,
                backgroundColor: '#FBCFE8', // 연핑크(임시)
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontWeight: '800' }}>내보내기</Text>
            </Pressable>
          </View>
        </View>

        {/* 기간 선택 */}
        <View style={{ marginTop: 14, flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={onPressStartDate}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 12,
              backgroundColor: '#E5E7EB',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontWeight: '800' }}>조회 시작 기간</Text>
          </Pressable>

          <Pressable
            onPress={onPressEndDate}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 12,
              backgroundColor: '#E5E7EB',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontWeight: '800' }}>조회 마감 기간</Text>
          </Pressable>
        </View>

        {/* 리스트 */}
        <View style={{ marginTop: 14, gap: 12 }}>
          {items.map(it => {
            const checked = !!selectedIds[it.id];
            const expanded = expandedId === it.id;

            return (
              <View key={it.id}>
                <View
                  style={{
                    borderRadius: 24,
                    backgroundColor: '#E5E7EB',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  {/* 체크박스 */}
                  <Pressable
                    onPress={() => toggleSelect(it.id)}
                    hitSlop={10}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      backgroundColor: '#F3F4F6',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontWeight: '900' }}>{checked ? '✓' : ''}</Text>
                  </Pressable>

                  {/* 내용(눌러서 상세) */}
                  <Pressable onPress={() => toggleExpand(it.id)} style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '900' }}>
                      {it.date} · {formatMoney(it.amount)}
                    </Text>
                    <Text style={{ marginTop: 6, color: '#374151' }}>
                      {it.title} / 자세히 보기
                    </Text>
                  </Pressable>
                </View>

                {/* 상세 정보(확장 영역) */}
                {expanded && (
                  <View
                    style={{
                      marginTop: 10,
                      borderRadius: 24,
                      backgroundColor: '#E5E7EB',
                      padding: 16,
                      gap: 8,
                    }}
                  >
                    <Text style={{ fontWeight: '900' }}>세부 정보</Text>
                    <Text>• 메모: {it.memo ?? '(없음)'}</Text>
                    <Text>• 영수증 이미지: {it.hasReceipt ? '있음(임시)' : '없음(임시)'}</Text>

                    <View
                      style={{
                        height: 110,
                        borderRadius: 18,
                        backgroundColor: '#D1D5DB',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 6,
                      }}
                    >
                      <Text style={{ color: '#374151' }}>영수증/이미지 영역(임시)</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* 하단 내보내기 버튼(와이어프레임 큰 버튼) */}
        <Pressable
          onPress={onPressExport}
          style={{
            marginTop: 18,
            height: 48,
            borderRadius: 12,
            backgroundColor: '#FBCFE8',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontWeight: '900' }}>내보내기</Text>
        </Pressable>
      </ScrollView>
    </ScreenLayout>
  );
}