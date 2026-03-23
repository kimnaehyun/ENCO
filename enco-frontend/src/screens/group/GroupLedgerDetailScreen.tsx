// src/screens/group/GroupLedgerDetailScreen.tsx
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';;
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { NativeModules } from 'react-native';
import ScreenLayout from '../../components/ScreenLayout';
import { LedgerItem, SettleMember } from '../../types/group';

const { OcrModule } = NativeModules;

type RouteParams = {
  item: LedgerItem;
  balance: number;
  isAdmin: boolean;
  groupName: string;
};

function formatMoney(n: number) {
  const sign = n >= 0 ? '+' : '-';
  return `${sign}${Math.abs(n).toLocaleString()}원`;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueWrap}>{children}</View>
    </View>
  );
}

export default function GroupLedgerDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { item, balance, isAdmin, groupName } = (route.params ?? {}) as RouteParams;

  const isPositive = item.amount >= 0;

  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [ocrLoading, setOcrLoading] = useState(false);

  // 정산 멤버 데이터 — LedgerItem에서 가져옴
  const settleMembers: SettleMember[] = item.settleMembers ?? [];
  const paidCount = settleMembers.filter(m => m.isPaid).length;
  const totalCount = settleMembers.length;
  const unpaidCount = totalCount - paidCount;
  const isSettled = item.isSettled ?? (totalCount === 0 || paidCount === totalCount);

  // OCR 실행
  const runOcr = async (uri: string) => {
    if (!OcrModule) return;
    try {
      setOcrLoading(true);
      const text = await OcrModule.recognizeTextFromUri(uri);
      setOcrText(text || '');
    } catch (e: any) {
      Alert.alert('OCR 실패', e?.message ?? '알 수 없는 오류');
    } finally {
      setOcrLoading(false);
    }
  };

  // 카메라 촬영
  const handleCamera = async () => {
    navigation.navigate('OcrTest');
  };

  // 갤러리 첨부
  const handleGallery = async () => {
    navigation.navigate('OcrTest');
  };

  // 영수증 삭제
  const handleDeleteReceipt = () => {
    Alert.alert('삭제', '영수증을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => { setReceiptUri(null); setOcrText(''); } },
    ]);
  };

  // 미납자 알림 보내기 (빠른 동작)
  const handleQuickNotify = () => {
    const unpaidNames = settleMembers
      .filter(m => !m.isPaid)
      .map(m => m.name)
      .join(', ');

    if (unpaidCount === 0) return;

    const perPerson = totalCount > 0 ? Math.ceil(Math.abs(item.amount) / totalCount) : 0;

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

        {/* 금액 + 잔액 */}
        <View
          className="bg-white rounded-3xl px-6 py-5 mb-4"
          style={styles.shadowCard}
        >
          <Text style={[styles.amountText, { color: isPositive ? '#1428A0' : '#EF4444' }]}>
            {formatMoney(item.amount)}
          </Text>
          <Text style={styles.balanceText}>잔액 {balance.toLocaleString()}원</Text>

          <View className="h-px bg-gray-100 mb-1" />

          <InfoRow label="사용카드">
            <Text style={styles.infoValueText}>회식주의자카드</Text>
          </InfoRow>

          {/* 상태 — 정산완료 / 정산미완료 (정산 필요한 출금만 표시) */}
          {item.needsSettle && (
            <InfoRow label="상태">
              <View style={[styles.statusBadge, { backgroundColor: isSettled ? '#22C55E' : '#EF4444' }]}>
                <Text style={styles.statusBadgeText}>
                  {isSettled ? '정산완료' : `정산미완료 (${paidCount}/${totalCount}명)`}
                </Text>
              </View>
            </InfoRow>
          )}

          <InfoRow label="잔액">
            <Text style={styles.infoValueText}>{balance.toLocaleString()}원</Text>
          </InfoRow>
          <InfoRow label="거래구분">
            <Text style={[
              styles.tradTypeText,
              { color: isPositive ? '#1428A0' : (item.needsSettle ? '#F59E0B' : '#EF4444') },
            ]}>
              {isPositive ? '입금' : (item.needsSettle ? '출금 (정산 필요)' : '출금')}
            </Text>
          </InfoRow>
          <InfoRow label="메모">
            <Text style={[styles.infoValueText, { color: item.memo ? '#111827' : '#D1D5DB' }]}>
              {item.memo || '내용을 입력하세요'}
            </Text>
          </InfoRow>

          {/* 영수증 행 */}
          <View className="flex-row items-start justify-between pt-3">
            <Text style={styles.infoLabel}>영수증</Text>
            <View style={styles.infoValueWrap}>
              {receiptUri ? (
                <View>
                  <Image
                    source={{ uri: receiptUri }}
                    style={styles.receiptImage}
                    resizeMode="cover"
                  />
                  {ocrLoading && (
                    <Text style={styles.ocrLoadingText}>OCR 분석 중...</Text>
                  )}
                  {ocrText !== '' && (
                    <View style={styles.ocrTextBox}>
                      <Text style={styles.ocrText}>{ocrText}</Text>
                    </View>
                  )}
                  {isAdmin && (
                    <Pressable onPress={handleDeleteReceipt}>
                      <Text style={styles.deleteReceiptText}>삭제</Text>
                    </Pressable>
                  )}
                </View>
              ) : (
                <Text style={styles.noReceiptText}>
                  {isAdmin ? '영수증을 등록하세요' : '등록된 영수증 없습니다'}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* 관리자 전용 — 영수증 촬영/첨부 버튼 */}
        {isAdmin && (
          <View className="flex-row gap-3">
            <Pressable
              onPress={handleCamera}
              className="flex-1 items-center justify-center rounded-2xl py-5 bg-white gap-2"
              style={styles.actionButtonShadow}
            >
              <Text style={styles.actionEmoji}>📷</Text>
              <Text style={styles.actionLabel}>영수증 촬영하기</Text>
            </Pressable>

            <Pressable
              onPress={handleGallery}
              className="flex-1 items-center justify-center rounded-2xl py-5 bg-white gap-2"
              style={styles.actionButtonShadow}
            >
              <Text style={styles.actionEmoji}>🖼️</Text>
              <Text style={styles.actionLabel}>사진 첨부하기</Text>
            </Pressable>
          </View>
        )}

        {/* ── 처리 미완료 시: 미납자 요약 + 알림 바로 보내기 ── */}
        {!isSettled && totalCount > 0 && (
          <View
            className="bg-white rounded-3xl px-6 py-5 mt-4"
            style={styles.unpaidCard}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text style={styles.unpaidTitle}>미납자 현황</Text>
              <View style={styles.unpaidBadge}>
                <Text style={styles.unpaidBadgeText}>{unpaidCount}명 미납</Text>
              </View>
            </View>

            {/* 미납자 목록 (간략) */}
            <View style={styles.memberList}>
              {settleMembers.filter(m => !m.isPaid).map(m => (
                <View key={m.id} className="flex-row items-center" style={styles.memberRow}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberEmoji}>🐹</Text>
                  </View>
                  <Text style={styles.memberName}>{m.name}</Text>
                  <Text style={styles.unpaidLabel}>미납</Text>
                </View>
              ))}
            </View>

            {/* 미납자 알림 보내기 (빠른 버튼) */}
            {isAdmin && (
              <Pressable
                onPress={handleQuickNotify}
                className="rounded-2xl py-3 items-center justify-center"
                style={styles.notifyButton}
              >
                <Text style={styles.notifyButtonText}>미납자에게 알림 보내기</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* 처리완료 시 완료 메시지 */}
        {isSettled && totalCount > 0 && (
          <View
            className="bg-white rounded-3xl px-6 py-5 mt-4 items-center"
            style={styles.settledCard}
          >
            <Text style={styles.settledEmoji}>✅</Text>
            <Text style={styles.settledTitle}>정산이 완료되었습니다</Text>
            <Text style={styles.settledSubtitle}>{totalCount}명 전원 납부 완료</Text>
          </View>
        )}

        {/* 정산인원 상세 보기 버튼 */}
        {totalCount > 0 && (
          <Pressable
            onPress={() => navigation.navigate('SettleMemberSelect', {
              amount: Math.abs(item.amount),
              storeName: item.title,
              date: item.date,
              memo: item.memo,
              receiptUri,
              groupName,
              settleMembers,
              isNewSettle: false,
            })}
            className="rounded-2xl py-4 items-center justify-center mt-3"
            style={styles.detailButton}
          >
            <Text style={styles.detailButtonText}>정산인원 상세 보기</Text>
          </Pressable>
        )}

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

  // ── 공통 카드 그림자 ─────────────────────
  shadowCard: {
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },

  // ── 금액 / 잔액 ───────────────────────────
  amountText: {
    fontSize: 32,
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
  tradTypeText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.bold,
  },

  // ── 영수증 ────────────────────────────────
  receiptImage: {
    width: 200,
    height: 260,
    borderRadius: 12,
    marginBottom: 8,
  },
  ocrLoadingText: {
    fontSize: 12,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
    textAlign: 'center',
  },
  ocrTextBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    maxWidth: 200,
  },
  ocrText: {
    fontSize: 11,
    color: COLORS.subtle,
    fontFamily: FONT_FAMILY.medium,
    lineHeight: 18,
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

  // ── 촬영/첨부 버튼 ────────────────────────
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
  memberList: {
    gap: 8,
    marginBottom: 12,
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
  unpaidLabel: {
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

  // ── 정산완료 카드 ─────────────────────────
  settledCard: {
    shadowColor: '#22C55E',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  settledEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  settledTitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.success,
  },
  settledSubtitle: {
    fontSize: 13,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
    marginTop: 4,
  },

  // ── 상세 보기 버튼 ────────────────────────
  detailButton: {
    backgroundColor: '#1428A0',
  },
  detailButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },
});
