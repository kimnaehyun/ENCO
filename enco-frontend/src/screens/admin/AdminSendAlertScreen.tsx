// src/screens/admin/AdminSendAlertScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, View, Image } from 'react-native'
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';;
import { useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';
import { sendDuesReminder, sendDuesReminderAll } from '../../services/receiptService';
import {
  getGroupPaymentStatus,
  type PaymentStatusMember,
} from '../../services/paymentService';
import { getProfileImage } from '../../types/images';

const formatKRW = (n: number) =>
  `₩ ${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

export default function AdminSendAlertScreen() {
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;

  const groupId = params.groupId ?? '';
  const groupName = params.groupName ?? '모임명';

  const [unpaidMembers, setUnpaidMembers] = useState<PaymentStatusMember[]>([]);
  const [paidMembers, setPaidMembers] = useState<PaymentStatusMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPaymentStatus = useCallback(async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      const res = await getGroupPaymentStatus(groupId);
      setUnpaidMembers(res.result.unpaidMembers);
      setPaidMembers(res.result.paidMembers);
    } catch (err: any) {
      console.log('[AdminSendAlert] fetch error:', JSON.stringify(err?.response?.data ?? err?.message, null, 2));
      console.log('[AdminSendAlert] status:', err?.response?.status);
      Alert.alert('오류', '납부 현황을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchPaymentStatus();
  }, [fetchPaymentStatus]);

  const [sentIds, setSentIds] = useState<Set<number>>(new Set());

  // 모달 상태: 'confirm' = 전송 전 확인, 'done' = 전송 완료
  const [modalMode, setModalMode] = useState<'confirm' | 'done'>('confirm');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  // 모달에서 "전송하기" 눌렀을 때 실행할 콜백
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const closeModal = () => {
    setModalVisible(false);
    setPendingAction(null);
  };

  const onSendAlert = (member: PaymentStatusMember) => {
    setModalMode('confirm');
    setModalMessage(`${member.name}님에게 ${formatKRW(member.unpaidAmount)} 입금 요청 알림을 보냅니다.`);
    setPendingAction(() => async () => {
      try {
        await sendDuesReminder(groupId, member.userId);
        setSentIds(prev => new Set(prev).add(member.userId));
        setModalMode('done');
        setModalMessage(`${member.name}님에게 알림을 전송했습니다.`);
      } catch {
        closeModal();
        Alert.alert('전송 실패', '알림 전송에 실패했습니다. 다시 시도해주세요.');
      }
    });
    setModalVisible(true);
  };

  const onSendAlertAll = () => {
    const unsent = unpaidMembers.filter(m => !sentIds.has(m.userId));
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
        await sendDuesReminderAll(groupId);
        const newSet = new Set(sentIds);
        unsent.forEach(m => newSet.add(m.userId));
        setSentIds(newSet);
        setModalMode('done');
        setModalMessage(`미납자 ${unsent.length}명에게 알림을 전송했습니다.`);
      } catch {
        closeModal();
        Alert.alert('전송 실패', '알림 전송에 실패했습니다. 다시 시도해주세요.');
      }
    });
    setModalVisible(true);
  };

  const renderMemberCard = (member: PaymentStatusMember, index: number, isLast: boolean, isUnpaid: boolean) => {
    const isSent = sentIds.has(member.userId);

    return (
      <View
        key={member.userId}
        style={[
          styles.memberCard,
          !isLast && styles.memberCardSpacing,
          isUnpaid && styles.memberCardUnpaid,
        ]}
      >
        <View style={styles.memberRow}>
          <View style={styles.avatarWrap}>
            <Image
              source={getProfileImage(member.profileImage)}
              style={styles.avatarImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.memberInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.memberName}>{member.name}</Text>
              <View style={[styles.badge, isUnpaid ? styles.badgeUnpaid : styles.badgePaid]}>
                <Text style={[styles.badgeText, isUnpaid ? styles.badgeUnpaidText : styles.badgePaidText]}>
                  {isUnpaid ? '미납' : '납부 완료'}
                </Text>
              </View>
            </View>
            {isUnpaid && (
              <Text style={styles.memberDue}>
                미납 금액: {formatKRW(member.unpaidAmount)}
              </Text>
            )}
          </View>

          {/* 알림 전송 버튼 (미납자만, 우측 배치) */}
          {isUnpaid && (
            <Pressable
              onPress={() => onSendAlert(member)}
              disabled={isSent}
              style={[styles.sendBadge, isSent && styles.sendBadgeSent]}
            >
              <Text style={[styles.sendBadgeText, isSent && styles.sendBadgeTextSent]}>
                {isSent ? '전송됨' : '전송'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenLayout>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#1428A0" />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* 헤더 */}
        <View className="flex-row items-center justify-between mb-5">
          <View>
            <Text style={styles.headerTitle}>미납자 알림 보내기</Text>
            <Text style={styles.headerSub}>
              {groupName} 미납자에게 알림을 보낼 수 있어요
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>미납 {unpaidMembers.length}명</Text>
          </View>
        </View>

        {/* 미납자 섹션 */}
        {unpaidMembers.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>미납자</Text>
              <View style={styles.sectionCountPill}>
                <Text style={styles.sectionCountText}>{unpaidMembers.length}</Text>
              </View>
            </View>

            {unpaidMembers.map((member, index) =>
              renderMemberCard(member, index, index === unpaidMembers.length - 1, true),
            )}
          </View>
        )}

        {/* 납부 완료 섹션 */}
        {paidMembers.length > 0 && (
          <View style={[styles.sectionCard, { marginTop: 16 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>납부 완료</Text>
              <View style={[styles.sectionCountPill, { backgroundColor: '#DCFCE7' }]}>
                <Text style={[styles.sectionCountText, { color: '#16A34A' }]}>{paidMembers.length}</Text>
              </View>
            </View>

            {paidMembers.map((member, index) =>
              renderMemberCard(member, index, index === paidMembers.length - 1, false),
            )}
          </View>
        )}

      </ScrollView>

      {/* 하단 일괄 전송 버튼 */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={onSendAlertAll}
          disabled={unpaidMembers.length === 0}
          style={[
            styles.bulkSendButton,
            unpaidMembers.length === 0 && styles.bulkSendButtonDisabled,
          ]}
        >
          <Text style={styles.bulkSendButtonText}>
            미납자 전체 알림 전송 ({unpaidMembers.length}명)
          </Text>
        </Pressable>
      </View>

      {/* 확인 / 완료 모달 */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
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
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  /* 헤더 */
  headerTitle: {
    fontSize: 20,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
  },
  headerSub: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },
  countBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  countBadgeText: {
    fontSize: 14,
    color: '#DC2626',
    fontFamily: FONT_FAMILY.bold,
  },

  /* 섹션 카드 */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
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

  /* 멤버 카드 */
  memberCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  memberCardSpacing: {
    marginBottom: 12,
  },
  memberCardUnpaid: {
    borderWidth: 1.5,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* 아바타 */
  avatarWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 38,
    height: 38,
  },

  /* 멤버 정보 */
  memberInfo: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 17,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },
  memberDue: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },

  /* 납부 배지 */
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgePaid: {
    backgroundColor: '#DCFCE7',
  },
  badgeUnpaid: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: FONT_FAMILY.bold,
  },
  badgePaidText: {
    color: '#16A34A',
  },
  badgeUnpaidText: {
    color: '#DC2626',
  },

  /* 알림 전송 배지 버튼 */
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

  /* 하단 버튼 */
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#F0F4FF',
  },
  bulkSendButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: '#1428A0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulkSendButtonDisabled: {
    opacity: 0.45,
  },
  bulkSendButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },

  /* 모달 */
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
});