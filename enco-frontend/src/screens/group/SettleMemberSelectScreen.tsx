// src/screens/group/SettleMemberSelectScreen.tsx
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';;
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import type {ReceiptDraft} from '../../types/receipt';

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
  receiptDraft?: ReceiptDraft | null;
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
        <View style={styles.container}>

          {/* 헤더 */}
          <View className="flex-row items-center justify-between mb-5">
            <Text style={styles.headerTitle}>정산 인원 선택</Text>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
              <Text style={styles.closeText}>닫기</Text>
            </Pressable>
          </View>

          {/* 정산 정보 요약 카드 */}
          <View
            className="bg-white rounded-3xl px-6 py-5 mb-5"
            style={styles.summaryCard}
          >
            <Text style={styles.summaryDate}>{params.date} · {params.storeName}</Text>
            <Text style={styles.summaryAmount}>-{amount.toLocaleString()}원</Text>
            {selectedIds.size > 0 && (
              <Text style={styles.summaryPerPerson}>
                1인당 {perPerson.toLocaleString()}원 · {selectedIds.size}명
              </Text>
            )}
          </View>

          {/* 전체 선택 */}
          <Pressable onPress={selectAll} className="flex-row items-center mb-4" style={styles.selectAllRow}>
            <View style={[
              styles.checkbox,
              selectedIds.size === ALL_GROUP_MEMBERS.length && styles.checkboxSelected,
            ]}>
              <Text style={styles.checkMark}>✓</Text>
            </View>
            <Text style={styles.selectAllText}>전체 선택</Text>
          </Pressable>

          {/* 멤버 리스트 */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.memberListContent}
            style={styles.memberListScroll}
          >
            {ALL_GROUP_MEMBERS.map(m => {
              const isSelected = selectedIds.has(m.id);
              return (
                <Pressable
                  key={m.id}
                  onPress={() => toggleMember(m.id)}
                  className="flex-row items-center"
                  style={styles.newMemberRow}
                >
                  {/* 체크박스 */}
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>

                  {/* 아바타 */}
                  <View style={[styles.newMemberAvatar, isSelected && styles.newMemberAvatarSelected]}>
                    <Text style={styles.memberEmoji}>🐹</Text>
                  </View>

                  {/* 이름 */}
                  <Text style={[styles.newMemberName, !isSelected && styles.newMemberNameInactive]}>
                    {m.name}
                  </Text>

                  {/* 1인당 금액 표시 */}
                  {isSelected && selectedIds.size > 0 && (
                    <Text style={styles.perPersonAmount}>{perPerson.toLocaleString()}원</Text>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* 하단 등록 버튼 */}
          <View style={styles.bottomBar}>
            <Pressable
              onPress={handleRegister}
              className="rounded-2xl py-4 items-center justify-center"
              style={[styles.registerButton, selectedIds.size === 0 && styles.registerButtonDisabled]}
            >
              <Text style={styles.registerButtonText}>
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
      <View style={styles.container}>

        {/* 헤더 */}
        <View className="flex-row items-center justify-between mb-5">
          <Text style={styles.headerTitle}>정산 현황</Text>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.closeText}>닫기</Text>
          </Pressable>
        </View>

        {/* 상태 요약 */}
        <View
          className="bg-white rounded-3xl px-6 py-5 mb-5"
          style={styles.summaryCard}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text style={styles.summaryRowLabel}>총 정산 금액</Text>
            <Text style={styles.summaryTotalAmount}>{amount.toLocaleString()}원</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text style={styles.summaryRowLabel}>1인당</Text>
            <Text style={styles.summaryPerPersonBlue}>{existingPerPerson.toLocaleString()}원</Text>
          </View>
          <View className="h-px bg-gray-100 my-3" />
          <View className="flex-row items-center" style={styles.statusDotRow}>
            <View className="flex-row items-center" style={styles.statusDotItem}>
              <View style={styles.dotGreen} />
              <Text style={styles.statusDotText}>완료 {paidCount}명</Text>
            </View>
            <View className="flex-row items-center" style={styles.statusDotItem}>
              <View style={styles.dotRed} />
              <Text style={styles.statusDotText}>미납 {unpaidCount}명</Text>
            </View>
          </View>
        </View>

        {/* 멤버 리스트 */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.memberListContent}
          style={styles.memberListScroll}
        >
          {/* 미납자 먼저 표시 */}
          {[...members].sort((a, b) => (a.isPaid === b.isPaid ? 0 : a.isPaid ? 1 : -1)).map(m => (
            <View key={m.id} className="flex-row items-center" style={styles.existingMemberRow}>
              {/* 아바타 */}
              <View style={[
                styles.existingMemberAvatar,
                { backgroundColor: m.isPaid ? '#F0FDF4' : '#FEF2F2', borderColor: m.isPaid ? '#22C55E' : '#EF4444' },
              ]}>
                <Text style={styles.existingMemberEmoji}>🐹</Text>
              </View>

              {/* 이름 */}
              <View style={styles.existingMemberInfo}>
                <Text style={styles.existingMemberName}>{m.name}</Text>
                <Text style={styles.existingMemberAmount}>{existingPerPerson.toLocaleString()}원</Text>
              </View>

              {/* 상태 배지 */}
              <View style={[styles.statusBadge, { backgroundColor: m.isPaid ? '#22C55E' : '#EF4444' }]}>
                <Text style={styles.statusBadgeText}>{m.isPaid ? '완료' : '미납'}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* 하단 미납자 알림 보내기 버튼 */}
        <View style={styles.bottomBar}>
          <Pressable
            onPress={onSendNotification}
            className="rounded-2xl py-4 items-center justify-center"
            style={[styles.notifyButton, unpaidCount === 0 && styles.notifyButtonDone]}
          >
            <Text style={styles.notifyButtonText}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── 헤더 ──────────────────────────────────
  headerTitle: {
    fontSize: 20,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
  },
  closeText: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },

  // ── 요약 카드 ─────────────────────────────
  summaryCard: {
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  summaryDate: {
    fontSize: 13,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 28,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.error,
    textAlign: 'right',
  },
  summaryPerPerson: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    textAlign: 'right',
    marginTop: 4,
  },
  summaryRowLabel: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },
  summaryTotalAmount: {
    fontSize: 22,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
  },
  summaryPerPersonBlue: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.brand,
  },
  statusDotRow: {
    gap: 16,
  },
  statusDotItem: {
    gap: 4,
  },
  dotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
  },
  dotRed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  statusDotText: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },

  // ── 전체 선택 ─────────────────────────────
  selectAllRow: {
    gap: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#1428A0',
  },
  checkMark: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  selectAllText: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
  },

  // ── 멤버 리스트 (공통) ────────────────────
  memberListScroll: {
    flex: 1,
  },
  memberListContent: {
    paddingBottom: 100,
    gap: 12,
  },

  // ── 새 정산 멤버 행 ───────────────────────
  newMemberRow: {
    gap: 12,
  },
  newMemberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newMemberAvatarSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#1428A0',
  },
  memberEmoji: {
    fontSize: 22,
  },
  newMemberName: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
    flex: 1,
  },
  newMemberNameInactive: {
    color: COLORS.placeholder,
  },
  perPersonAmount: {
    fontSize: 14,
    color: COLORS.brand,
    fontFamily: FONT_FAMILY.bold,
  },

  // ── 기존 정산 멤버 행 ─────────────────────
  existingMemberRow: {
    gap: 12,
  },
  existingMemberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  existingMemberEmoji: {
    fontSize: 28,
  },
  existingMemberInfo: {
    flex: 1,
  },
  existingMemberName: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
  },
  existingMemberAmount: {
    fontSize: 12,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontSize: 13,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },

  // ── 하단 버튼 ─────────────────────────────
  bottomBar: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  registerButton: {
    backgroundColor: '#1428A0',
  },
  registerButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  registerButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },
  notifyButton: {
    backgroundColor: '#EF4444',
  },
  notifyButtonDone: {
    backgroundColor: '#D1D5DB',
  },
  notifyButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },
});
