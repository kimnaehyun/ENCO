// src/screens/group/GroupLedgerScreen.tsx
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';
import { LedgerItem } from '../../types/group';

function formatMoney(n: number) {
  const sign = n >= 0 ? '+' : '-';
  return `${sign}${Math.abs(n).toLocaleString()}원`;
}

export default function GroupLedgerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;
  const groupName = params.groupName ?? '모임명';
  const isAdmin = !!params.isAdmin;

  const items: LedgerItem[] = useMemo(() => [
    { id: 'l1', date: '3.9',  amount: +10,    title: '모임원출석',        memo: '김채아', hasReceipt: false },
    { id: 'l2', date: '3.8',  amount: +10000, title: '김싸피 모임비 납입', memo: '',      hasReceipt: false },
    { id: 'l3', date: '3.8',  amount: +10000, title: '이싸피 모임비 납입', memo: '',      hasReceipt: false },
    { id: 'l4', date: '3.7',  amount: +10000, title: '최싸피 모임비 납입', memo: '',      hasReceipt: false },
    { id: 'l5', date: '3.5',  amount: -50000, title: '출금',              memo: '',      hasReceipt: true  },
  ], []);

  const balance    = 854440;
  const paidAmount = 854000;
  const pointAmount = 443;

  // 누적 잔액 계산
  const runningBalances = useMemo(() => {
    const result: Record<string, number> = {};
    let running = balance;
    items.forEach(it => {
      result[it.id] = running;
      running -= it.amount;
    });
    return result;
  }, [items, balance]);

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* 헤더 */}
        <View className="flex-row items-center justify-between mb-4">
          <Text style={{ fontSize: 20, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}>
            모임 장부
          </Text>
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
          <View className="h-px bg-gray-100 mb-3" />
          <View className="flex-row justify-between">
            <Text style={{ fontSize: 13, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>납부 금액</Text>
            <Text style={{ fontSize: 13, color: '#111827', fontFamily: 'GmarketSansTTFBold' }}>{paidAmount.toLocaleString()}원</Text>
          </View>
          <View className="flex-row justify-between mt-1">
            <Text style={{ fontSize: 13, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>포인트 금액</Text>
            <Text style={{ fontSize: 13, color: '#111827', fontFamily: 'GmarketSansTTFBold' }}>{pointAmount.toLocaleString()}원</Text>
          </View>
        </View>

        {/* 정산하기 / 필터 — 관리자만 정산하기 표시 */}
        <View className="flex-row gap-3 mb-4">
          {isAdmin && (
            <Pressable
              onPress={() => Alert.alert('정산하기', 'TODO: 정산 기능')}
              className="flex-1 rounded-2xl py-3 items-center justify-center"
              style={{ backgroundColor: '#1428A0' }}
            >
              <Text style={{ fontSize: 15, color: '#fff', fontFamily: 'GmarketSansTTFBold' }}>정산하기</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => Alert.alert('필터', 'TODO: 필터 UI')}
            className={`rounded-2xl py-3 px-6 items-center justify-center bg-white ${!isAdmin ? 'flex-1' : ''}`}
            style={{ shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 8, elevation: 1 }}
          >
            <Text style={{ fontSize: 15, color: '#374151', fontFamily: 'GmarketSansTTFBold' }}>필터</Text>
          </Pressable>
        </View>

        {/* 거래 내역 리스트 */}
        <View className="gap-2">
          {items.map((it) => {
            const isPositive = it.amount >= 0;
            return (
              <Pressable
                key={it.id}
                onPress={() => navigation.navigate('GroupLedgerDetail', {
                  item: it,
                  balance: runningBalances[it.id],
                  isAdmin,
                  groupName,
                })}
                className="bg-white rounded-2xl px-5 py-4"
                style={{ shadowColor: '#1428A0', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }}
              >
                <View className="flex-row items-center justify-between">
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'GmarketSansTTFMedium', marginBottom: 2 }}>
                      {it.date}
                    </Text>
                    <Text style={{ fontSize: 15, color: '#111827', fontFamily: 'GmarketSansTTFBold' }}>
                      {it.title}
                    </Text>
                    {it.memo ? (
                      <View className="mt-1 self-start rounded-lg px-2 py-0.5" style={{ backgroundColor: '#22C55E' }}>
                        <Text style={{ fontSize: 12, color: '#fff', fontFamily: 'GmarketSansTTFBold' }}>{it.memo}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View className="items-end">
                    <Text style={{ fontSize: 18, fontFamily: 'GmarketSansTTFBold', color: isPositive ? '#1428A0' : '#EF4444' }}>
                      {formatMoney(it.amount)}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'GmarketSansTTFMedium', marginTop: 2 }}>
                      {runningBalances[it.id].toLocaleString()}원
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

      </ScrollView>
    </ScreenLayout>
  );
}