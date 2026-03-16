// src/screens/group/GroupLedgerScreen.tsx
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';
import { LedgerItem } from '../../types/group';

function formatMoney(n: number) {
  const sign = n >= 0 ? '+' : '-';
  const abs = Math.abs(n);
  return `${sign}${abs.toLocaleString()}원`;
}

export default function GroupLedgerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;
  const groupName = params.groupName ?? '모임명';

  const items: LedgerItem[] = useMemo(
    () => [
      { id: 'l1', date: '3.9', amount: +10,    title: '모임원출석', memo: '김채아', hasReceipt: false },
      { id: 'l2', date: '3.8', amount: +10000, title: '김싸피 모임비 납입', memo: '', hasReceipt: false },
      { id: 'l3', date: '3.8', amount: +10000, title: '이싸피 모임비 납입', memo: '', hasReceipt: false },
      { id: 'l4', date: '3.7', amount: +10000, title: '최싸피 모임비 납입', memo: '', hasReceipt: false },
      { id: 'l5', date: '3.5', amount: -50000, title: '출금', memo: '', hasReceipt: true },
    ],
    []
  );

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const balance = 854440;
  const paidAmount = 854000;
  const pointAmount = 443;

  const onPressSettle = () => Alert.alert('정산하기', 'TODO: 정산 기능');
  const onPressFilter = () => Alert.alert('필터', 'TODO: 필터 UI');

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* 헤더 타이틀 */}
        <View className="flex-row items-center justify-between mb-4">
          <Text style={{ fontSize: 20, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}>
            모임 장부
          </Text>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>닫기</Text>
          </Pressable>
        </View>

        {/* 잔액 카드 */}
        <View
          className="bg-white rounded-3xl px-6 py-5 mb-4"
          style={{ shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 }}
        >
          <Text style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'GmarketSansTTFMedium', marginBottom: 4 }}>
            현재 모임 통장 잔액
          </Text>
          <Text style={{ fontSize: 28, fontFamily: 'GmarketSansTTFBold', color: '#111827', textAlign: 'right', marginBottom: 12 }}>
            {balance.toLocaleString()}원
          </Text>

          {/* 구분선 */}
          <View className="h-px bg-gray-100 mb-3" />

          <View className="flex-row justify-between">
            <Text style={{ fontSize: 13, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>납부 금액</Text>
            <Text style={{ fontSize: 13, color: '#111827', fontFamily: 'GmarketSansTTFBold' }}>
              {paidAmount.toLocaleString()}원
            </Text>
          </View>
          <View className="flex-row justify-between mt-1">
            <Text style={{ fontSize: 13, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>포인트 금액</Text>
            <Text style={{ fontSize: 13, color: '#111827', fontFamily: 'GmarketSansTTFBold' }}>
              {pointAmount.toLocaleString()}원
            </Text>
          </View>
        </View>

        {/* 정산하기 / 필터 버튼 */}
        <View className="flex-row gap-3 mb-4">
          <Pressable
            onPress={onPressSettle}
            className="flex-1 rounded-2xl py-3 items-center justify-center"
            style={{ backgroundColor: '#1428A0' }}
          >
            <Text style={{ fontSize: 15, color: '#fff', fontFamily: 'GmarketSansTTFBold' }}>정산하기</Text>
          </Pressable>

          <Pressable
            onPress={onPressFilter}
            className="rounded-2xl py-3 px-6 items-center justify-center bg-white"
            style={{ shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 8, elevation: 1 }}
          >
            <Text style={{ fontSize: 15, color: '#374151', fontFamily: 'GmarketSansTTFBold' }}>필터</Text>
          </Pressable>
        </View>

        {/* 거래 내역 리스트 */}
        <View className="gap-2">
          {items.map((it) => {
            const isPositive = it.amount >= 0;
            const expanded = expandedId === it.id;

            return (
              <View key={it.id}>
                <Pressable
                  onPress={() => setExpandedId(prev => prev === it.id ? null : it.id)}
                  className="bg-white rounded-2xl px-5 py-4"
                  style={{ shadowColor: '#1428A0', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }}
                >
                  <View className="flex-row items-center justify-between">
                    {/* 날짜 + 제목 */}
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'GmarketSansTTFMedium', marginBottom: 2 }}>
                        {it.date}
                      </Text>
                      <Text style={{ fontSize: 15, color: '#111827', fontFamily: 'GmarketSansTTFBold' }}>
                        {it.title}
                      </Text>
                      {it.memo ? (
                        <View
                          className="mt-1 self-start rounded-lg px-2 py-0.5"
                          style={{ backgroundColor: '#22C55E' }}
                        >
                          <Text style={{ fontSize: 12, color: '#fff', fontFamily: 'GmarketSansTTFBold' }}>
                            {it.memo}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* 금액 */}
                    <View className="items-end">
                      <Text style={{
                        fontSize: 18,
                        fontFamily: 'GmarketSansTTFBold',
                        color: isPositive ? '#1428A0' : '#EF4444',
                      }}>
                        {formatMoney(it.amount)}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'GmarketSansTTFMedium', marginTop: 2 }}>
                        {/* 잔액(임시) */}
                        {(854440 - items.slice(0, items.findIndex(i => i.id === it.id)).reduce((s, i) => s + i.amount, 0)).toLocaleString()}원
                      </Text>
                    </View>
                  </View>
                </Pressable>

                {/* 상세 확장 */}
                {expanded && (
                  <View
                    className="bg-white rounded-2xl px-5 py-4 mt-1"
                    style={{ shadowColor: '#1428A0', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }}
                  >
                    <Text style={{ fontSize: 13, color: '#374151', fontFamily: 'GmarketSansTTFMedium' }}>
                      메모: {it.memo || '(없음)'}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#374151', fontFamily: 'GmarketSansTTFMedium', marginTop: 4 }}>
                      영수증: {it.hasReceipt ? '있음' : '없음'}
                    </Text>
                    {it.hasReceipt && (
                      <View
                        className="mt-3 rounded-xl items-center justify-center"
                        style={{ height: 100, backgroundColor: '#F3F4F6' }}
                      >
                        <Text style={{ color: '#9CA3AF' }}>영수증 이미지 영역</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

      </ScrollView>
    </ScreenLayout>
  );
}