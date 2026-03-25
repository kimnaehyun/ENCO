// src/screens/group/SettleDetailScreen.tsx
import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Text, {FONT_FAMILY, COLORS} from '@/components/typography';
import {useNavigation, useRoute} from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import {
  deleteSettlement,
  getSettlementDefaulters,
  getSettlementDetail,
} from '../../services/receiptService';
import {getGroupMembers} from '../../services/groupService';
import type {SettlementDetailResponse} from '../../types/receipt';

type SettleMember = {
  id: string;
  userId: number;
  name: string;
  isPaid: boolean;
  amount?: number;
  remainingAmount?: number;
};

type RouteParams = {
  expenseId?: number;
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

const formatSettlementDate = (value: string) => {
  if (!value) {
    return '';
  }

  const isoPrefix = value.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoPrefix)) {
    return isoPrefix;
  }

  return value;
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
    expenseId,
    amount = 0,
    storeName = '',
    date = '',
    memo = '',
    receiptUri = null,
    groupName = '모임명',
    groupId,
    isSettled: initialSettled = false,
  } = params;
  const numericGroupId = groupId ? Number(groupId) : NaN;
  const numericExpenseId = typeof expenseId === 'number' ? expenseId : NaN;

  const [memoText, setMemoText] = useState(memo);
  const [detail, setDetail] = useState<SettlementDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [settleMembers, setSettleMembers] = useState<SettleMember[]>(
    params.settleMembers ?? [],
  );
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(numericGroupId) || !Number.isFinite(numericExpenseId)) {
      return;
    }

    let mounted = true;
    setLoadingDetail(true);
    setDetailError('');

    getSettlementDetail(numericGroupId, numericExpenseId)
      .then(response => {
        if (!mounted) {
          return;
        }

        setDetail(response);
        setMemoText(response.memo || memo);
      })
      .catch((error: any) => {
        if (!mounted) {
          return;
        }

        setDetailError(
          error?.response?.data?.message ||
            error?.message ||
            '정산 상세 정보를 불러오지 못했습니다.',
        );
      })
      .finally(() => {
        if (mounted) {
          setLoadingDetail(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [memo, numericExpenseId, numericGroupId]);

  useEffect(() => {
    if (!Number.isFinite(numericGroupId) || !Number.isFinite(numericExpenseId)) {
      return;
    }

    let mounted = true;
    setLoadingParticipants(true);

    Promise.all([
      getSettlementDefaulters(numericGroupId, numericExpenseId),
      getGroupMembers(numericGroupId).catch(() => ({message: '', result: []})),
    ])
      .then(([defaultersResponse, membersResponse]) => {
        if (!mounted) {
          return;
        }

        const memberNameMap = new Map(
          membersResponse.result.map(member => [
            member.userId,
            member.name?.trim() || `멤버 ${member.userId}`,
          ]),
        );

        const nextMembers = defaultersResponse.participants.map(participant => ({
          id: String(participant.chargeTargetId || participant.userId),
          userId: participant.userId,
          name: memberNameMap.get(participant.userId) || `멤버 ${participant.userId}`,
          isPaid:
            participant.status === 'PAID' || participant.remainingAmount <= 0,
          amount: participant.amount,
          remainingAmount: participant.remainingAmount,
        }));

        setSettleMembers(nextMembers);
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        setSettleMembers(params.settleMembers ?? []);
      })
      .finally(() => {
        if (mounted) {
          setLoadingParticipants(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [numericExpenseId, numericGroupId, params.settleMembers]);

  const fallbackPaidCount = settleMembers.filter(member => member.isPaid).length;
  const fallbackTotalCount = settleMembers.length;
  const paidCount = detail?.paidCount ?? fallbackPaidCount;
  const totalCount = detail?.totalCount ?? fallbackTotalCount;
  const unpaidCount = Math.max(totalCount - paidCount, 0);
  const isSettled =
    initialSettled ||
    (totalCount > 0 && paidCount === totalCount) ||
    detail?.status === 'PAID';
  const effectiveAmount =
    amount > 0
      ? amount
      : detail?.paymentInfo?.totalAmount ?? detail?.amount ?? 0;
  const effectiveStoreName =
    detail?.paymentInfo?.merchantName || detail?.displayName || storeName || '정산 요청';
  const effectiveDate = formatSettlementDate(detail?.paidAt || date);
  const effectiveReceiptUri = detail?.receiptImageUrl || receiptUri;
  const unpaidMembers = settleMembers.filter(member => !member.isPaid);
  const perPerson = totalCount > 0 ? Math.ceil(effectiveAmount / totalCount) : 0;
  const canDeleteSettlement =
    Number.isFinite(numericGroupId) && Number.isFinite(numericExpenseId);

  const handleNotify = () => {
    if (unpaidMembers.length === 0) {
      Alert.alert('안내', '미납자 목록 정보가 없습니다.');
      return;
    }

    const unpaidNames = unpaidMembers
      .map(member => member.name)
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

  const handleDeleteSettlement = () => {
    if (!canDeleteSettlement) {
      Alert.alert('안내', '삭제에 필요한 정산 정보가 없습니다.');
      return;
    }

    Alert.alert('정산 요청 삭제', '이 정산 요청을 삭제할까요?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(true);
            const response = await deleteSettlement(numericGroupId, numericExpenseId);
            Alert.alert('완료', response.message, [
              {
                text: '확인',
                onPress: () => {
                  navigation.popToTop();
                  navigation.navigate('GroupLedger', {
                    groupId,
                    groupName,
                  });
                },
              },
            ]);
          } catch (error: any) {
            Alert.alert(
              '삭제 실패',
              error?.response?.data?.message ||
                error?.message ||
                '정산 요청 삭제 중 오류가 발생했습니다.',
            );
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const settlementStatusText = useMemo(() => {
    if (isSettled) {
      return '정산완료';
    }

    return `정산미완료 (${paidCount}/${totalCount}명)`;
  }, [isSettled, paidCount, totalCount]);

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

        {loadingDetail ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#1428A0" />
            <Text style={styles.loadingText}>정산 상세 정보를 불러오는 중...</Text>
          </View>
        ) : null}

        {loadingParticipants ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#1428A0" />
            <Text style={styles.loadingText}>정산 인원 정보를 불러오는 중...</Text>
          </View>
        ) : null}

        {detailError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{detailError}</Text>
          </View>
        ) : null}

        <Text style={styles.storeDateText}>{effectiveDate} {effectiveStoreName}</Text>

        <Text style={styles.amountText}>-{effectiveAmount.toLocaleString()}원</Text>

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
                {settlementStatusText}
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
              {effectiveReceiptUri ? (
                <Image
                  source={{ uri: effectiveReceiptUri }}
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

            {unpaidMembers.length > 0 ? unpaidMembers.map(m => (
              <View key={m.id} className="flex-row items-center mb-2" style={styles.memberRow}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberEmoji}>🐹</Text>
                </View>
                <Text style={styles.memberName}>{m.name}</Text>
                <Text style={styles.memberAmount}>
                  {(m.remainingAmount ?? m.amount ?? perPerson).toLocaleString()}원
                </Text>
              </View>
            )) : (
              <Text style={styles.helperDescription}>
                현재 화면에는 미납자 상세 목록이 없어 인원 수만 표시합니다.
              </Text>
            )}

            {unpaidMembers.length > 0 ? (
              <Pressable
                onPress={handleNotify}
                className="rounded-2xl py-3 items-center justify-center mt-2"
                style={styles.notifyButton}
              >
                <Text style={styles.notifyButtonText}>미납자에게 알림 보내기</Text>
              </Pressable>
            ) : null}
          </View>
        )}

        {settleMembers.length > 0 ? (
          <Pressable
            onPress={() => navigation.navigate('SettleMemberSelect', {
              amount: effectiveAmount,
              storeName: effectiveStoreName,
              date: effectiveDate,
              memo: memoText,
              receiptUri: effectiveReceiptUri,
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
        ) : null}

        {canDeleteSettlement ? (
          <Pressable
            onPress={handleDeleteSettlement}
            disabled={deleting}
            className="rounded-2xl py-4 items-center justify-center"
            style={[styles.deleteSettlementButton, deleting && styles.deleteSettlementButtonDisabled]}
          >
            <Text style={styles.deleteSettlementButtonText}>
              {deleting ? '정산 요청 삭제 중...' : '정산 요청 삭제'}
            </Text>
          </Pressable>
        ) : null}

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
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
  },
  closeText: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },

  // ── 금액 정보 ─────────────────────────────
  storeDateText: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    marginBottom: 2,
  },
  amountText: {
    fontSize: 32,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.error,
    marginBottom: 16,
  },

  // ── 공통 카드 그림자 ─────────────────────
  shadowCard: {
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.error,
    fontFamily: FONT_FAMILY.medium,
  },

  // ── InfoRow ────────────────────────────────
  infoLabel: {
    fontSize: 13,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
  },
  infoValueWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  infoValueText: {
    fontSize: 14,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.medium,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },
  tradeTypeText: {
    fontSize: 14,
    color: COLORS.warning,
    fontFamily: FONT_FAMILY.bold,
  },
  memoInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.medium,
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
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
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
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
  },
  unpaidBadge: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  unpaidBadgeText: {
    fontSize: 12,
    color: COLORS.error,
    fontFamily: FONT_FAMILY.bold,
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
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
    flex: 1,
  },
  memberAmount: {
    fontSize: 13,
    color: COLORS.error,
    fontFamily: FONT_FAMILY.bold,
  },
  notifyButton: {
    backgroundColor: '#EF4444',
  },
  notifyButtonText: {
    fontSize: 14,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },
  helperDescription: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    lineHeight: 20,
  },

  // ── 정산인원 보기 버튼 ────────────────────
  settleDetailButton: {
    backgroundColor: '#1428A0',
    marginBottom: 12,
  },
  settleDetailButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },
  deleteSettlementButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EF4444',
    marginBottom: 12,
  },
  deleteSettlementButtonDisabled: {
    opacity: 0.6,
  },
  deleteSettlementButtonText: {
    fontSize: 16,
    color: '#EF4444',
    fontFamily: FONT_FAMILY.bold,
  },
});
