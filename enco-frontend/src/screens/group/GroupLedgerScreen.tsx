// src/screens/group/GroupLedgerScreen.tsx
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';
import { LedgerItem } from '../../types/group';

function formatMoney(n: number) {
  const sign = n >= 0 ? '+' : '-';
  return `${sign}${Math.abs(n).toLocaleString()}원`;
}

/** 거래구분 라벨 */
function txLabel(it: LedgerItem) {
  if (it.amount >= 0) return '입금';
  return it.needsSettle ? '출금 (정산 필요)' : '출금';
}

/** 거래구분 색상 */
function txColor(it: LedgerItem) {
  if (it.amount >= 0) return '#1428A0';
  return it.needsSettle ? '#F59E0B' : '#EF4444';
}

type FilterKey = 'settled' | 'unsettled' | 'deposit' | 'withdraw' | 'withdraw_settle';

export default function GroupLedgerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;
  const groupName = params.groupName ?? '모임명';
  const isAdmin = !!params.isAdmin;

  const items: LedgerItem[] = useMemo(() => [
    {
      id: 'l1', date: '3.9', amount: +10, title: '모임원출석',
      memo: '김채아', hasReceipt: false,
      needsSettle: false, isSettled: true, settleMembers: [],
    },
    {
      id: 'l2', date: '3.8', amount: +10000, title: '김싸피 모임비 납입',
      memo: '', hasReceipt: false,
      needsSettle: false, isSettled: true, settleMembers: [],
    },
    {
      id: 'l3', date: '3.8', amount: +10000, title: '이싸피 모임비 납입',
      memo: '', hasReceipt: false,
      needsSettle: false, isSettled: true, settleMembers: [],
    },
    {
      id: 'l4', date: '3.7', amount: -30000, title: '카페 결제',
      memo: '', hasReceipt: true,
      needsSettle: false, isSettled: true, settleMembers: [],
    },
    {
      id: 'l5', date: '3.5', amount: -50000, title: '회식 결제',
      memo: '', hasReceipt: true,
      needsSettle: true, isSettled: false,
      settleMembers: [
        { id: 'm1', name: '김싸피', isPaid: true },
        { id: 'm2', name: '고싸피', isPaid: false },
        { id: 'm3', name: '장싸피', isPaid: true },
        { id: 'm4', name: '정싸피', isPaid: false },
      ],
    },
  ], []);

  // ── 필터 (다중 선택) ──
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());
  const [filterVisible, setFilterVisible] = useState(false);

  const filterGroups: { title: string; options: { key: FilterKey; label: string }[] }[] = [
    {
      title: '정산 상태',
      options: [
        { key: 'unsettled', label: '정산미완료' },
        { key: 'settled', label: '정산완료' },
      ],
    },
    {
      title: '거래 구분',
      options: [
        { key: 'deposit', label: '입금' },
        { key: 'withdraw', label: '출금' },
        { key: 'withdraw_settle', label: '출금 (정산 필요)' },
      ],
    },
  ];

  // filterOptions flat list (칩 표시용)
  const allFilterOptions = filterGroups.flatMap(g => g.options);

  const toggleFilter = (key: FilterKey) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const removeFilter = (key: FilterKey) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const filteredItems = useMemo(() => {
    if (activeFilters.size === 0) return items;

    return items.filter(it => {
      // 정산 상태 필터
      const settleFilters = [activeFilters.has('settled'), activeFilters.has('unsettled')];
      const hasSettleFilter = settleFilters.some(Boolean);

      // 거래 구분 필터
      const txFilters = [activeFilters.has('deposit'), activeFilters.has('withdraw'), activeFilters.has('withdraw_settle')];
      const hasTxFilter = txFilters.some(Boolean);

      // 정산 상태 매칭
      let settleMatch = true;
      if (hasSettleFilter) {
        const matchSettled = activeFilters.has('settled') && !!it.isSettled;
        const matchUnsettled = activeFilters.has('unsettled') && !it.isSettled;
        settleMatch = matchSettled || matchUnsettled;
      }

      // 거래 구분 매칭
      let txMatch = true;
      if (hasTxFilter) {
        const isDeposit = it.amount >= 0;
        const isWithdrawSettle = it.amount < 0 && !!it.needsSettle;
        const isWithdrawOnly = it.amount < 0 && !it.needsSettle;

        const matchDeposit = activeFilters.has('deposit') && isDeposit;
        const matchWithdraw = activeFilters.has('withdraw') && isWithdrawOnly;
        const matchWithdrawSettle = activeFilters.has('withdraw_settle') && isWithdrawSettle;
        txMatch = matchDeposit || matchWithdraw || matchWithdrawSettle;
      }

      // 두 그룹 모두 AND 조건
      return settleMatch && txMatch;
    });
  }, [items, activeFilters]);

  const balance     = 854440;
  const paidAmount  = 854000;
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

        {/* 정산하기 / 필터 버튼 + 활성 필터 칩 */}
        <View className="flex-row items-center gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
          {isAdmin && (
            <Pressable
              onPress={() => navigation.navigate('OcrTest', { groupName, groupId: params.groupId })}
              className="rounded-2xl py-3 items-center justify-center"
              style={{ backgroundColor: '#1428A0', paddingHorizontal: 20 }}
            >
              <Text style={{ fontSize: 15, color: '#fff', fontFamily: 'GmarketSansTTFBold' }}>정산하기</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => setFilterVisible(true)}
            className="rounded-2xl py-3 px-5 items-center justify-center bg-white"
            style={{ shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 8, elevation: 1 }}
          >
            <Text style={{ fontSize: 15, color: '#374151', fontFamily: 'GmarketSansTTFBold' }}>필터</Text>
          </Pressable>

          {/* 활성 필터 칩 */}
          {allFilterOptions
            .filter(opt => activeFilters.has(opt.key))
            .map(opt => (
              <View
                key={opt.key}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#EEF2FF',
                  borderRadius: 20,
                  paddingLeft: 12,
                  paddingRight: 6,
                  paddingVertical: 6,
                  gap: 4,
                  borderWidth: 1,
                  borderColor: '#C7D2FE',
                }}
              >
                <Text style={{ fontSize: 13, color: '#1428A0', fontFamily: 'GmarketSansTTFBold' }}>
                  {opt.label}
                </Text>
                <Pressable
                  onPress={() => removeFilter(opt.key)}
                  hitSlop={8}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#C7D2FE',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#1428A0', fontWeight: '700', lineHeight: 14 }}>✕</Text>
                </Pressable>
              </View>
            ))}
        </View>

        {/* 거래 내역 리스트 */}
        <View className="gap-2">
          {filteredItems.map((it) => {
            const isPositive = it.amount >= 0;
            const members = it.settleMembers ?? [];
            const paidCount = members.filter(m => m.isPaid).length;
            const totalCount = members.length;
            const settled = it.isSettled ?? true;

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
                    {/* 날짜 + 정산 상태 배지 */}
                    <View className="flex-row items-center" style={{ gap: 8, marginBottom: 2 }}>
                      <Text style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'GmarketSansTTFMedium' }}>
                        {it.date}
                      </Text>
                      {/* 정산 필요한 출금만 배지 표시 */}
                      {it.needsSettle && (
                        <View style={{
                          backgroundColor: settled ? '#22C55E' : '#EF4444',
                          borderRadius: 10,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                        }}>
                          <Text style={{ fontSize: 10, color: '#fff', fontFamily: 'GmarketSansTTFBold' }}>
                            {settled ? '정산완료' : `정산미완료 ${paidCount}/${totalCount}`}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* 제목 */}
                    <Text style={{ fontSize: 15, color: '#111827', fontFamily: 'GmarketSansTTFBold' }}>
                      {it.title}
                    </Text>

                    {/* 거래구분 태그 */}
                    <View className="mt-1 self-start rounded-lg px-2 py-0.5" style={{ backgroundColor: txColor(it) }}>
                      <Text style={{ fontSize: 11, color: '#fff', fontFamily: 'GmarketSansTTFBold' }}>
                        {txLabel(it)}
                      </Text>
                    </View>

                    {it.memo ? (
                      <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium', marginTop: 4 }}>
                        {it.memo}
                      </Text>
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

      {/* ── 필터 바텀시트 모달 ── */}
      <Modal
        visible={filterVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterVisible(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}
          onPress={() => setFilterVisible(false)}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 24,
              paddingTop: 20,
              paddingBottom: 36,
            }}
          >
            {/* 핸들 바 */}
            <View style={{
              width: 40, height: 4, borderRadius: 2,
              backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 20,
            }} />

            <Text style={{ fontSize: 17, fontFamily: 'GmarketSansTTFBold', color: '#111827', marginBottom: 16 }}>
              필터 선택
            </Text>

            <View style={{ gap: 20 }}>
              {filterGroups.map((group) => (
                <View key={group.title}>
                  <Text style={{ fontSize: 13, fontFamily: 'GmarketSansTTFMedium', color: '#9CA3AF', marginBottom: 8 }}>
                    {group.title}
                  </Text>
                  <View style={{ gap: 8 }}>
                    {group.options.map((opt) => {
                      const selected = activeFilters.has(opt.key);
                      return (
                        <Pressable
                          key={opt.key}
                          onPress={() => toggleFilter(opt.key)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: selected ? '#EEF2FF' : '#F9FAFB',
                            borderRadius: 16,
                            paddingHorizontal: 20,
                            paddingVertical: 16,
                            borderWidth: selected ? 1.5 : 0,
                            borderColor: selected ? '#1428A0' : 'transparent',
                          }}
                        >
                          <Text style={{
                            fontSize: 15,
                            fontFamily: 'GmarketSansTTFBold',
                            color: selected ? '#1428A0' : '#374151',
                          }}>
                            {opt.label}
                          </Text>
                          {selected && (
                            <Text style={{ fontSize: 16, color: '#1428A0' }}>✓</Text>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>

            {/* 확인 버튼 */}
            <Pressable
              onPress={() => setFilterVisible(false)}
              style={{
                backgroundColor: '#1428A0',
                borderRadius: 16,
                paddingVertical: 14,
                alignItems: 'center',
                marginTop: 16,
              }}
            >
              <Text style={{ fontSize: 15, color: '#fff', fontFamily: 'GmarketSansTTFBold' }}>확인</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenLayout>
  );
}