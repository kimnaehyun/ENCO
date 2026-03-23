// src/screens/group/SettleDetailScreen.tsx
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
  isSettled?: boolean;
};

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueWrap}>{children}</View>
    </View>
  );
}

export default function SettleDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as RouteParams;

  const {
    amount = 10000,
    storeName = '맥도날드',
    date = '2026-03-05',
    memo = '',
    receiptUri = null,
    groupName = '모임명',
    groupId,
    isSettled: initialSettled = false,
  } = params;

  const [memoText, setMemoText] = useState(memo);

  // 정산 멤버 데이터
  const [settleMembers] = useState<SettleMember[]>(
    params.settleMembers ?? [
      { id: 'm1', name: '김싸피', isPaid: true },
      { id: 'm2', name: '고싸피', isPaid: false },
      { id: 'm3', name: '장싸피', isPaid: true },
      { id: 'm4', name: '정싸피', isPaid: false },
    ]
  );

  const paidCount = settleMembers.filter(m => m.isPaid).length;
  const totalCount = settleMembers.length;
  const unpaidCount = totalCount - paidCount;
  const isSettled = initialSettled || paidCount === totalCount;
  const perPerson = totalCount > 0 ? Math.ceil(amount / totalCount) : 0;

  // 미납자 알림
  const handleNotify = () => {
    const unpaidNames = settleMembers
      .filter(m => !m.isPaid)
      .map(m => m.name)
      .join(', ');

    if (unpaidCount === 0) {
      Alert.alert('안내', '모든 멤버가 납부 완료했습니다.');
      return;
    }

    Alert.alert(
      '미납자 알림 보내기',
      `${unpaidNames}에게 ${perPerson.toLocaleString()}원 입금 요청 알림을 보냅니다.`,
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

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* 헤더 */}
        <View className="flex-row items-center justify-between mb-5">
          <Text style={styles.headerTitle}>모임 장부</Text>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.closeText}>닫기</Text>
          </Pressable>
        </View>

        {/* 날짜 + 가맹점 */}
        <Text style={styles.storeDateText}>{date} {storeName}</Text>

        {/* 금액 */}
        <Text style={styles.amountText}>-{amount.toLocaleString()}원</Text>

        {/* 정보 카드 */}
        <View
          className="bg-white rounded-3xl px-6 py-5 mb-4"
          style={styles.shadowCard}
        >
          <InfoRow label="사용카드">
            <Text style={styles.infoValueText}>총무개인카드</Text>
          </InfoRow>

          <InfoRow label="상태">
            <View style={[styles.statusBadge, { backgroundColor: isSettled ? '#22C55E' : '#EF4444' }]}>
              <Text style={styles.statusBadgeText}>
                {isSettled ? '정산완료' : `정산미완료 (${paidCount}/${totalCount}명)`}
              </Text>
            </View>
          </InfoRow>

          <InfoRow label="거래구분">
            <Text style={styles.tradeTypeText}>출금 (정산 필요)</Text>
          </InfoRow>

          {/* 메모 (편집 가능) */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text style={styles.infoLabel}>메모</Text>
            <TextInput
              value={memoText}
              onChangeText={setMemoText}
              placeholder="내용을 입력하세요"
              placeholderTextColor="#D1D5DB"
              style={styles.memoInput}
            />
          </View>

          {/* 영수증 */}
          <View className="flex-row items-start justify-between pt-3">
            <Text style={styles.infoLabel}>영수증</Text>
            <View style={styles.infoValueWrap}>
              {receiptUri ? (
                <Image
                  source={{ uri: receiptUri }}
                  style={styles.receiptImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.receiptPlaceholder}>
                  <Text style={styles.receiptEmoji}>🧾</Text>
                  <Text style={styles.receiptPlaceholderText}>
                    RECEIPT{'\n'}(임시 영수증)
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ── 미완료 시 미납자 요약 카드 ── */}
        {!isSettled && unpaidCount > 0 && (
          <View
            className="bg-white rounded-3xl px-6 py-5 mb-4"
            style={styles.unpaidCard}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text style={styles.unpaidTitle}>미납자 현황</Text>
              <View style={styles.unpaidBadge}>
                <Text style={styles.unpaidBadgeText}>{unpaidCount}명 미납</Text>
              </View>
            </View>

            {settleMembers.filter(m => !m.isPaid).map(m => (
              <View key={m.id} className="flex-row items-center mb-2" style={styles.memberRow}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberEmoji}>🐹</Text>
                </View>
                <Text style={styles.memberName}>{m.name}</Text>
                <Text style={styles.memberAmount}>{perPerson.toLocaleString()}원</Text>
              </View>
            ))}

            {/* 미납자 알림 보내기 */}
            <Pressable
              onPress={handleNotify}
              className="rounded-2xl py-3 items-center justify-center mt-2"
              style={styles.notifyButton}
            >
              <Text style={styles.notifyButtonText}>미납자에게 알림 보내기</Text>
            </Pressable>
          </View>
        )}

        {/* 정산인원 보기 버튼 */}
        <Pressable
          onPress={() => navigation.navigate('SettleMemberSelect', {
            amount,
            storeName,
            date,
            memo: memoText,
            receiptUri,
            groupName,
            groupId,
            settleMembers,
            isNewSettle: false,
          })}
          className="rounded-2xl py-4 items-center justify-center"
          style={styles.settleDetailButton}
        >
          <Text style={styles.settleDetailButtonText}>정산인원 보기</Text>
        </Pressable>

      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },

  // ── 헤더 ──────────────────────────────────
  headerTitle: {
    fontSize: 20,
    fontFamily: 'GmarketSansTTFBold',
    color: '#111827',
  },
  closeText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFMedium',
  },

  // ── 금액 정보 ─────────────────────────────
  storeDateText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFMedium',
    marginBottom: 2,
  },
  amountText: {
    fontSize: 32,
    fontFamily: 'GmarketSansTTFBold',
    color: '#EF4444',
    marginBottom: 16,
  },

  // ── 공통 카드 그림자 ─────────────────────
  shadowCard: {
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },

  // ── InfoRow ────────────────────────────────
  infoLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    fontFamily: 'GmarketSansTTFMedium',
  },
  infoValueWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  infoValueText: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'GmarketSansTTFMedium',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'GmarketSansTTFBold',
  },
  tradeTypeText: {
    fontSize: 14,
    color: '#F59E0B',
    fontFamily: 'GmarketSansTTFBold',
  },
  memoInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontFamily: 'GmarketSansTTFMedium',
    textAlign: 'right',
    paddingVertical: 0,
    marginLeft: 12,
  },

  // ── 영수증 ────────────────────────────────
  receiptImage: {
    width: 200,
    height: 260,
    borderRadius: 12,
  },
  receiptPlaceholder: {
    width: 160,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  receiptEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  receiptPlaceholderText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'GmarketSansTTFMedium',
    textAlign: 'center',
  },

  // ── 미납자 카드 ───────────────────────────
  unpaidCard: {
    shadowColor: '#EF4444',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  unpaidTitle: {
    fontSize: 15,
    fontFamily: 'GmarketSansTTFBold',
    color: '#111827',
  },
  unpaidBadge: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  unpaidBadgeText: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily: 'GmarketSansTTFBold',
  },
  memberRow: {
    gap: 10,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberEmoji: {
    fontSize: 18,
  },
  memberName: {
    fontSize: 14,
    fontFamily: 'GmarketSansTTFBold',
    color: '#111827',
    flex: 1,
  },
  memberAmount: {
    fontSize: 13,
    color: '#EF4444',
    fontFamily: 'GmarketSansTTFBold',
  },
  notifyButton: {
    backgroundColor: '#EF4444',
  },
  notifyButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'GmarketSansTTFBold',
  },

  // ── 정산인원 보기 버튼 ────────────────────
  settleDetailButton: {
    backgroundColor: '#1428A0',
  },
  settleDetailButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'GmarketSansTTFBold',
  },
});
