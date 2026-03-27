// src/screens/group/SettleDetailScreen.tsx
import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
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
  sendSettlementReminder,
} from '../../services/receiptService';
import {getGroupMembers} from '../../services/groupService';
import type {SettlementDetailResponse} from '../../types/receipt';
import {getProfileImage} from '../../types/images';

type SettleMember = {
  id: string;
  userId: number;
  name: string;
  profileUrl?: string | number | null;
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
  const [sendingReminder, setSendingReminder] = useState(false);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'confirm' | 'done'>('confirm');
  const [modalMessage, setModalMessage] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const closeModal = () => {
    setModalVisible(false);
    setPendingAction(null);
  };

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
            {
              name: member.name?.trim() || `멤버 ${member.userId}`,
              profileUrl: member.profileImage ?? member.profileUrl ?? member.profileImg ?? null,
            },
          ]),
        );

        const nextMembers = defaultersResponse.participants.map(participant => ({
          id: String(participant.chargeTargetId || participant.userId),
          userId: participant.userId,
          name:
            memberNameMap.get(participant.userId)?.name ||
            `멤버 ${participant.userId}`,
          profileUrl: memberNameMap.get(participant.userId)?.profileUrl ?? null,
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

  const formatKRW = (n: number) =>
    `₩ ${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

  const doSendReminder = async () => {
    if (!Number.isFinite(numericGroupId) || !Number.isFinite(numericExpenseId)) {
      Alert.alert('안내', '알림 전송에 필요한 정산 정보가 없습니다.');
      return;
    }
    try {
      setSendingReminder(true);
      const response = await sendSettlementReminder(numericGroupId, numericExpenseId);
      console.log('[SettlementReminder] response:', JSON.stringify(response, null, 2));
      return response;
    } catch (error: any) {
      console.log('[SettlementReminder] error:', JSON.stringify(error?.response?.data ?? error?.message, null, 2));
      throw error;
    } finally {
      setSendingReminder(false);
    }
  };

  const onSendAlertSingle = (member: SettleMember) => {
    const memberAmount = member.remainingAmount ?? member.amount ?? perPerson;
    setModalMode('confirm');
    setModalMessage(`${member.name}님에게 ${formatKRW(memberAmount)} 입금 요청 알림을 보냅니다.`);
    setPendingAction(() => async () => {
      try {
        const response = await doSendReminder();
        setSentIds(prev => new Set(prev).add(member.id));
        setModalMode('done');
        setModalMessage(`${member.name}님에게 알림을 전송했습니다.`);
      } catch (error: any) {
        setModalMode('done');
        setModalMessage(error?.response?.data?.message || '알림 전송에 실패했습니다.');
      }
    });
    setModalVisible(true);
  };

  const onSendAlertAll = () => {
    const unsent = unpaidMembers.filter(m => !sentIds.has(m.id));
    if (unsent.length === 0) {
      setModalMode('done');
      setModalMessage('모든 미납자에게 이미 알림을 전송했습니다.');
      setModalVisible(true);
      return;
    }
    setModalMode('confirm');
    setModalMessage(`미납자 ${unsent.length}명에게 입금 요청 알림을 보냅니다.`);
    setPendingAction(() => async () => {
      try {
        const response = await doSendReminder();
        const newSet = new Set(sentIds);
        unsent.forEach(m => newSet.add(m.id));
        setSentIds(newSet);
        setModalMode('done');
        setModalMessage(`미납자 ${unsent.length}명에게 알림을 전송했습니다.`);
      } catch (error: any) {
        setModalMode('done');
        setModalMessage(error?.response?.data?.message || '알림 전송에 실패했습니다.');
      }
    });
    setModalVisible(true);
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

        {/* ── 미완료 시 미납자 섹션 (AdminSendAlert 디자인) ── */}
        {!isSettled && unpaidCount > 0 && unpaidMembers.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>미납자</Text>
              <View style={styles.sectionCountPill}>
                <Text style={styles.sectionCountText}>{unpaidCount}</Text>
              </View>
            </View>

            {unpaidMembers.map((m, index) => {
              const isSent = sentIds.has(m.id);
              const memberAmount = m.remainingAmount ?? m.amount ?? perPerson;
              return (
                <View
                  key={m.id}
                  style={[
                    styles.alertMemberCard,
                    styles.alertMemberCardUnpaid,
                    index !== unpaidMembers.length - 1 && styles.alertMemberCardSpacing,
                  ]}
                >
                  <View style={styles.alertMemberRow}>
                    <View style={styles.alertAvatarWrap}>
                      <Image
                        source={getProfileImage(m.profileUrl)}
                        style={styles.alertAvatarImage}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={styles.alertMemberInfo}>
                      <View style={styles.alertNameRow}>
                        <Text style={styles.alertMemberName}>{m.name}</Text>
                        <View style={styles.alertBadgeUnpaid}>
                          <Text style={styles.alertBadgeUnpaidText}>미납</Text>
                        </View>
                      </View>
                      <Text style={styles.alertMemberDue}>
                        미납 금액: {formatKRW(memberAmount)}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => onSendAlertSingle(m)}
                      disabled={isSent || sendingReminder}
                      style={[styles.sendBadge, isSent && styles.sendBadgeSent]}
                    >
                      <Text style={[styles.sendBadgeText, isSent && styles.sendBadgeTextSent]}>
                        {isSent ? '전송됨' : '전송'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* 납부 완료 섹션 */}
        {!isSettled && settleMembers.filter(m => m.isPaid).length > 0 && (
          <View style={[styles.sectionCard, { marginTop: 16 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>납부 완료</Text>
              <View style={[styles.sectionCountPill, { backgroundColor: '#DCFCE7' }]}>
                <Text style={[styles.sectionCountText, { color: '#16A34A' }]}>
                  {settleMembers.filter(m => m.isPaid).length}
                </Text>
              </View>
            </View>

            {settleMembers.filter(m => m.isPaid).map((m, index, arr) => (
              <View
                key={m.id}
                style={[
                  styles.alertMemberCard,
                  index !== arr.length - 1 && styles.alertMemberCardSpacing,
                ]}
              >
                <View style={styles.alertMemberRow}>
                  <View style={styles.alertAvatarWrap}>
                    <Image
                      source={getProfileImage(m.profileUrl)}
                      style={styles.alertAvatarImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.alertMemberInfo}>
                    <View style={styles.alertNameRow}>
                      <Text style={styles.alertMemberName}>{m.name}</Text>
                      <View style={styles.alertBadgePaid}>
                        <Text style={styles.alertBadgePaidText}>납부 완료</Text>
                      </View>
                    </View>
                    <Text style={styles.alertMemberDue}>
                      납부 금액: {formatKRW(m.amount ?? perPerson)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 미납자 전체 알림 전송 버튼 */}
        {!isSettled && unpaidMembers.length > 0 && (
          <Pressable
            onPress={onSendAlertAll}
            disabled={sendingReminder}
            style={[styles.bulkSendButton, sendingReminder && styles.bulkSendButtonDisabled]}
          >
            <Text style={styles.bulkSendButtonText}>
              {sendingReminder ? '알림 전송 중...' : `미납자 전체 알림 전송 (${unpaidCount}명)`}
            </Text>
          </Pressable>
        )}

        {settleMembers.length > 0 ? (
          <Pressable
            onPress={() => navigation.navigate('SettleMemberSelect', {
              amount: effectiveAmount,
              storeName: effectiveStoreName,
              date: effectiveDate,
              memo: memoText,
              receiptUri: effectiveReceiptUri,
              expenseId: numericExpenseId,
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

      {/* 확인 / 완료 모달 */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
          <View style={styles.modalCard}>
            <Pressable onPress={closeModal} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>

            <Text style={styles.modalTitle}>
              {modalMode === 'confirm' ? '알림 전송' : '전송 완료'}
            </Text>
            <Text style={styles.modalDescription}>{modalMessage}</Text>

            {modalMode === 'confirm' && (
              <Text style={styles.modalInfo}>
                알림은 앱 푸시 알림으로 전송됩니다.{'\n'}
                전송된 알림은 취소할 수 없습니다.
              </Text>
            )}

            {modalMode === 'confirm' ? (
              <View style={styles.modalButtonRow}>
                <Pressable onPress={closeModal} style={styles.modalCancelButton}>
                  <Text style={styles.modalCancelText}>취소</Text>
                </Pressable>
                <Pressable
                  onPress={() => pendingAction?.()}
                  style={styles.modalConfirmButton}
                >
                  <Text style={styles.modalConfirmText}>전송하기</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={closeModal} style={styles.modalDoneButton}>
                <Text style={styles.modalConfirmText}>확인</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
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
    lineHeight: 42,
    fontFamily: FONT_FAMILY.bold,
    paddingVertical: 2,
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

  // ── 섹션 카드 (Admin 디자인) ──────────────
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
  },
  sectionCountPill: {
    marginLeft: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionCountText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.bold,
    color: '#DC2626',
  },
  alertMemberCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  alertMemberCardSpacing: {
    marginBottom: 12,
  },
  alertMemberCardUnpaid: {
    borderWidth: 1.5,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  alertMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertAvatarWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  alertAvatarImage: {
    width: '100%',
    height: '100%',
  },
  alertMemberInfo: {
    flex: 1,
    marginLeft: 14,
  },
  alertNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertMemberName: {
    fontSize: 17,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },
  alertBadgeUnpaid: {
    backgroundColor: '#FEE2E2',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  alertBadgeUnpaidText: {
    fontSize: 11,
    fontFamily: FONT_FAMILY.bold,
    color: '#DC2626',
  },
  alertBadgePaid: {
    backgroundColor: '#DCFCE7',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  alertBadgePaidText: {
    fontSize: 11,
    fontFamily: FONT_FAMILY.bold,
    color: '#16A34A',
  },
  alertMemberDue: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },
  sendBadge: {
    marginLeft: 10,
    backgroundColor: '#1428A0',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  sendBadgeSent: {
    backgroundColor: '#9CA3AF',
  },
  sendBadgeText: {
    fontSize: 12,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },
  sendBadgeTextSent: {
    color: '#E5E7EB',
  },
  bulkSendButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: '#1428A0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  bulkSendButtonDisabled: {
    opacity: 0.45,
  },
  bulkSendButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },

  // ── 모달 ────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#1428A0',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.bold,
  },
  modalTitle: {
    marginTop: 6,
    fontSize: 19,
    color: COLORS.dark,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.bold,
  },
  modalDescription: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.muted,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.medium,
  },
  modalInfo: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 20,
    color: COLORS.placeholder,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.medium,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.bold,
  },
  modalConfirmButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#1428A0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontSize: 15,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },
  modalDoneButton: {
    marginTop: 20,
    width: '100%',
    height: 46,
    borderRadius: 14,
    backgroundColor: '#1428A0',
    alignItems: 'center',
    justifyContent: 'center',
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
