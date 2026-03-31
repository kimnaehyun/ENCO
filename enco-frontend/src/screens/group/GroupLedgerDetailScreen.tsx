// src/screens/group/GroupLedgerDetailScreen.tsx
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import {
  getGroupTransactionDetail,
  GroupTransactionDetailResponse,
} from '../../services/paymentService';

import { GroupStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RouteParams = {
  groupId?: string;
  groupName?: string;
  isAdmin?: boolean;
  transactionId?: number;
  referenceType?: 'TRANSACTION' | 'EXPENSE' | 'POINT';
  pointId?: number;
  listItem?: {
    title: string;
    amount: number;
    transactionDate: string;
    balanceAfter: number;
    type: 'DEPOSIT' | 'WITHDRAW';
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
  };
};

type DetailResult = GroupTransactionDetailResponse['result'];
type LedgerStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';

type GroupLedgerDetailRouteProp = RouteProp<
  GroupStackParamList,
  'GroupLedgerDetail'
>;
type GroupLedgerDetailNavigationProp = NativeStackNavigationProp<
  GroupStackParamList,
  'GroupLedgerDetail'
>;

function formatMoney(n: number) {
  const sign = n >= 0 ? '+' : '-';
  return `${sign}${Math.abs(n).toLocaleString()}원`;
}

function getTransactionStatusMeta(status?: LedgerStatus) {
  switch (status) {
    case 'PENDING':
      return { label: '진행중', color: '#F59E0B' };
    case 'REJECTED':
      return { label: '거절', color: '#EF4444' };
    case 'CANCELED':
      return { label: '취소', color: '#9CA3AF' };
    case 'APPROVED':
      return { label: '완료', color: '#1428A0' };
    default:
      return { label: '정상', color: COLORS.dark };
  }
}

function toSafeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return fallback;
}

function formatDateTime(dateStr?: string | null) {
  if (!dateStr) return '-';
  // '2026-03-24T16:04:14.780828' → '2026.03.24 16:04:14'
  const [datePart, timePart] = dateStr.split('T');
  if (!datePart) return dateStr;
  const time = timePart ? timePart.slice(0, 8) : '';
  return time
    ? `${datePart.replace(/-/g, '.')} ${time}`
    : datePart.replace(/-/g, '.');
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueWrap}>{children}</View>
    </View>
  );
}

export default function GroupLedgerDetailScreen() {
  const navigation = useNavigation<GroupLedgerDetailNavigationProp>();
  const route = useRoute<GroupLedgerDetailRouteProp>();
  const {
    groupId,
    groupName,
    isAdmin,
    transactionId,
    referenceType,
    pointId,
    listItem,
  } = route.params ?? {};

  const [detail, setDetail] = useState<DetailResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localReceiptUri, setLocalReceiptUri] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    // POINT: 상세 API 미연결 → listItem 기반으로 표시
    if (referenceType === 'POINT') {
      console.log('[PointDetail] route item:', listItem);
      console.log('[PointDetail] pointId:', pointId);
      return;
    }

    const numericGroupId = groupId ? Number(groupId) : NaN;

    console.log('[TransactionDetail] groupId:', numericGroupId);
    console.log('[TransactionDetail] transactionId:', transactionId);

    if (!Number.isFinite(numericGroupId) || !transactionId) {
      setError('거래 상세 내역이 없습니다.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await getGroupTransactionDetail(
        numericGroupId,
        transactionId,
      );
      console.log('[TransactionDetail] success:', result);
      setDetail(result.result);
    } catch (err: unknown) {
      console.error('[TransactionDetail] failed:', err);
      console.error(
        '[TransactionDetail] status:',
        (err as { response?: { status?: number } })?.response?.status,
      );
      console.error(
        '[TransactionDetail] data:',
        (err as { response?: { data?: unknown } })?.response?.data,
      );
      setError('거래 상세 내역을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [groupId, transactionId, referenceType, pointId, listItem]);

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [fetchDetail]),
  );

  const handleReceiptProof = () => {
    if (!transactionId) return;
    navigation.navigate('TransactionReceiptOcr', {
      groupId,
      groupName,
      transactionId, // number로 좁혀짐
    });
  };

  const handleDeleteReceipt = () => {
    Alert.alert('삭제', '영수증을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => setLocalReceiptUri(null),
      },
    ]);
  };

  // 영수증 이미지: 로컬 촬영 > API 응답 순서로 우선
  const receiptImageUrl =
    localReceiptUri ?? detail?.receipt?.receiptImageUrl ?? null;
  const receiptContent = detail?.receipt?.receiptContent ?? null;
  const receiptItems = Array.isArray(receiptContent?.items)
    ? receiptContent.items
    : [];
  const transactionStatus = listItem?.status;
  const statusMeta = getTransactionStatusMeta(transactionStatus);
  const isCanceled = transactionStatus === 'CANCELED';
  const isApproved = !transactionStatus || transactionStatus === 'APPROVED';

  const effectiveType = listItem?.type;
  const isDeposit = effectiveType
    ? effectiveType === 'DEPOSIT'
    : referenceType === 'POINT'
      ? listItem?.type === 'DEPOSIT'
      : detail
        ? detail.amount >= 0
        : false;

  const signedDetailAmount = detail
    ? isDeposit
      ? toSafeNumber(detail.amount)
      : -toSafeNumber(detail.amount)
    : 0;

  return (
    <ScreenLayout>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 헤더 */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>거래 상세</Text>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.closeText}>닫기</Text>
          </Pressable>
        </View>

        {/* 로딩 */}
        {isLoading && (
          <View style={styles.statusCard}>
            <Text style={styles.statusText}>
              거래 상세 내역을 불러오는 중...
            </Text>
          </View>
        )}

        {/* 에러 */}
        {!isLoading && error && (
          <View style={styles.statusCard}>
            <Text style={styles.statusText}>{error}</Text>
          </View>
        )}

        {/* 데이터 없음 (TRANSACTION 전용) */}
        {!isLoading && !error && !detail && referenceType !== 'POINT' && (
          <View style={styles.statusCard}>
            <Text style={styles.statusText}>거래 상세 내역이 없습니다.</Text>
          </View>
        )}

        {/* POINT 상세 — listItem 기반 표시 (API 미연결) */}
        {referenceType === 'POINT' && listItem && (
          <View style={[styles.card, styles.shadowCard]}>
            <Text style={[styles.amountText, { color: '#F59E0B' }]}>
              {formatMoney(isDeposit ? listItem.amount : -listItem.amount)}
            </Text>
            <Text style={styles.balanceText}>
              잔액 {toSafeNumber(listItem.balanceAfter).toLocaleString()}원
            </Text>

            <View style={styles.divider} />

            <InfoRow label="내용">
              <Text style={styles.infoValueText}>{listItem.title}</Text>
            </InfoRow>
            <InfoRow label="거래일시">
              <Text style={styles.infoValueText}>
                {formatDateTime(listItem.transactionDate)}
              </Text>
            </InfoRow>
            <InfoRow label="거래유형">
              <Text style={styles.infoValueText}>포인트</Text>
            </InfoRow>
            <InfoRow label="거래 후 잔액">
              <Text style={styles.infoValueText}>
                {toSafeNumber(listItem.balanceAfter).toLocaleString()}원
              </Text>
            </InfoRow>
          </View>
        )}

        {/* 본문 */}
        {!isLoading && detail && (
          <>
            {/* 금액 + 기본 정보 카드 */}
            <View style={[styles.card, styles.shadowCard]}>
              <Text
                style={[
                  styles.amountText,
                  {
                    color: !isApproved
                      ? statusMeta.color
                      : isDeposit
                        ? '#1428A0'
                        : '#EF4444',
                  },
                ]}
              >
                {formatMoney(signedDetailAmount)}
              </Text>
              {!isApproved && (
                <Text
                  style={[styles.canceledNotice, { color: statusMeta.color }]}
                >
                  {statusMeta.label} 상태의 거래입니다
                </Text>
              )}
              <Text style={styles.balanceText}>
                잔액 {toSafeNumber(detail.balanceAfter).toLocaleString()}원
              </Text>

              <View style={styles.divider} />

              <InfoRow label="표시명">
                <Text style={styles.infoValueText}>{detail.displayName}</Text>
              </InfoRow>
              <InfoRow label="거래일시">
                <Text style={styles.infoValueText}>
                  {formatDateTime(detail.transactionDate)}
                </Text>
              </InfoRow>
              <InfoRow label="거래유형">
                <Text style={styles.infoValueText}>
                  {detail.type === 'CARD_PAYMENT' ? '카드 결제' : '이체'}
                </Text>
              </InfoRow>
              <InfoRow label="거래상태">
                <Text
                  style={[styles.infoValueText, { color: statusMeta.color }]}
                >
                  {statusMeta.label}
                </Text>
              </InfoRow>
              {detail.cardName && (
                <InfoRow label="사용카드">
                  <Text style={styles.infoValueText}>{detail.cardName}</Text>
                </InfoRow>
              )}
              <InfoRow label="거래 후 잔액">
                <Text style={styles.infoValueText}>
                  {toSafeNumber(detail.balanceAfter).toLocaleString()}원
                </Text>
              </InfoRow>
              <InfoRow label="메모">
                <Text
                  style={[
                    styles.infoValueText,
                    { color: detail.memo ? COLORS.dark : '#D1D5DB' },
                  ]}
                >
                  {detail.memo || '없음'}
                </Text>
              </InfoRow>

              {/* 영수증 */}
              <View style={styles.receiptRow}>
                <Text style={styles.infoLabel}>영수증</Text>
                <View style={styles.infoValueWrap}>
                  {receiptImageUrl ? (
                    <View>
                      <Image
                        source={{ uri: receiptImageUrl }}
                        style={styles.receiptImage}
                        resizeMode="cover"
                      />
                      {isAdmin && (
                        <Pressable onPress={handleDeleteReceipt}>
                          <Text style={styles.deleteReceiptText}>삭제</Text>
                        </Pressable>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.noReceiptText}>
                      {isAdmin
                        ? '영수증을 등록하세요'
                        : '등록된 영수증 없습니다'}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* 영수증 내용 (receiptContent가 있을 때) */}
            {receiptContent && (
              <View style={[styles.card, styles.shadowCard, { marginTop: 12 }]}>
                <Text style={styles.sectionTitle}>영수증 내용</Text>
                <InfoRow label="가맹점">
                  <Text style={styles.infoValueText}>
                    {receiptContent.merchantName}
                  </Text>
                </InfoRow>
                {receiptContent.address ? (
                  <InfoRow label="주소">
                    <Text style={styles.infoValueText}>
                      {receiptContent.address}
                    </Text>
                  </InfoRow>
                ) : null}
                <InfoRow label="결제일시">
                  <Text style={styles.infoValueText}>
                    {receiptContent.paidAt}
                  </Text>
                </InfoRow>
                {receiptContent.totalAmount != null && (
                  <InfoRow label="합계">
                    <Text style={styles.infoValueText}>
                      {toSafeNumber(
                        receiptContent.totalAmount,
                      ).toLocaleString()}
                      원
                    </Text>
                  </InfoRow>
                )}
                {receiptContent.businessNumber && (
                  <InfoRow label="사업자번호">
                    <Text style={styles.infoValueText}>
                      {receiptContent.businessNumber}
                    </Text>
                  </InfoRow>
                )}
                {receiptItems.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={[styles.infoLabel, { marginBottom: 6 }]}>
                      구매 항목
                    </Text>
                    {receiptItems.map((item, idx) => (
                      <View key={idx} style={styles.receiptItem}>
                        <Text style={styles.receiptItemName}>{item.name}</Text>
                        {item.amount != null && (
                          <Text style={styles.receiptItemAmount}>
                            {toSafeNumber(item.amount).toLocaleString()}원
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* 관리자 전용 — 영수증 증빙 */}
            {isAdmin && isApproved && (
              <View style={styles.actionRow}>
                <Pressable
                  onPress={handleReceiptProof}
                  style={[styles.actionButton, styles.actionButtonShadow]}
                >
                  <Text style={styles.actionEmoji}>🧾</Text>
                  <Text style={styles.actionLabel}>영수증 증빙</Text>
                </Pressable>
              </View>
            )}

            {/* TODO: 정산 관련 UI (settleMembers, 미납자 알림 등)
                정산 상세 API가 준비되면 이 위치에 다시 붙일 것
                필요 데이터: settleMembers, paidCount, isSettled
                예상 endpoint: GET /groups/{groupId}/settlements/{settlementId} */}
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
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

  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
  },
  shadowCard: {
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },

  amountText: {
    fontSize: 32,
    lineHeight: 42,
    fontFamily: FONT_FAMILY.bold,
    textAlign: 'right',
    marginBottom: 4,
  },
  canceledNotice: {
    fontSize: 13,
    color: '#9CA3AF',
    fontFamily: FONT_FAMILY.bold,
    textAlign: 'right',
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 13,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
    textAlign: 'right',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 4,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
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
    textAlign: 'right',
    flexShrink: 1,
  },

  receiptRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  receiptImage: {
    width: 200,
    height: 260,
    borderRadius: 12,
    marginBottom: 8,
  },
  deleteReceiptText: {
    fontSize: 12,
    color: COLORS.error,
    fontFamily: FONT_FAMILY.medium,
    textAlign: 'right',
  },
  noReceiptText: {
    fontSize: 13,
    color: COLORS.faint,
    fontFamily: FONT_FAMILY.medium,
  },

  sectionTitle: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
    marginBottom: 8,
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  receiptItemName: {
    fontSize: 13,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.medium,
    flex: 1,
  },
  receiptItemAmount: {
    fontSize: 13,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  actionButtonShadow: {
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionLabel: {
    fontSize: 14,
    color: COLORS.subtle,
    fontFamily: FONT_FAMILY.bold,
  },
});
