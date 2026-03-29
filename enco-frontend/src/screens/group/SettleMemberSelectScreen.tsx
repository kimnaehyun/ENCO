// src/screens/group/SettleMemberSelectScreen.tsx
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
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ScreenLayout from '../../components/ScreenLayout';
import {getGroupMembers} from '../../services/groupService';
import {createSettlement, sendSettlementReminder} from '../../services/receiptService';
import type {ReceiptDraft} from '../../types/receipt';
import {getProfileImage} from '../../types/images';

type SettleMember = {
  id: string;
  userId: number;
  name: string;
  profileUrl?: string | number | null;
  isPaid: boolean;
};

type RouteParams = {
  expenseId?: number;
  amount: number;
  storeName: string;
  date: string;
  memo: string;
  receiptUri: string | null;
  receiptDraft?: ReceiptDraft | null;
  groupName: string;
  groupId?: string;
  settleMembers?: SettleMember[];
  isNewSettle?: boolean;
};

const FALLBACK_SETTLE_MEMBERS: SettleMember[] = [
  {id: 'm1', userId: 1, name: '김싸피', isPaid: true},
  {id: 'm2', userId: 2, name: '고싸피', isPaid: false},
  {id: 'm3', userId: 3, name: '장싸피', isPaid: true},
  {id: 'm4', userId: 4, name: '정싸피', isPaid: false},
];

export default function SettleMemberSelectScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const params = (route.params ?? {}) as RouteParams;

  const {amount = 10000, groupName = '', isNewSettle = false} = params;
  const numericGroupId = params.groupId ? Number(params.groupId) : NaN;

  const [submitting, setSubmitting] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberLoadError, setMemberLoadError] = useState('');
  const [settlementMembers, setSettlementMembers] = useState<SettleMember[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [displayName, setDisplayName] = useState(
    params.receiptDraft?.merchantName || params.storeName || '',
  );
  const [memo, setMemo] = useState(isNewSettle ? '' : params.memo || '');
  const [receiverBankName, setReceiverBankName] = useState('');
  const [receiverAccountNumber, setReceiverAccountNumber] = useState('');
  const [sendingReminder, setSendingReminder] = useState(false);
  const handleReceiverAccountNumberChange = (value: string) => {
    setReceiverAccountNumber(value.replace(/\D/g, ''));
  };

  useEffect(() => {
    if (!isNewSettle) {
      return;
    }

    if (!Number.isFinite(numericGroupId)) {
      setMemberLoadError('유효한 모임 ID가 없어 정산 대상자를 불러올 수 없습니다.');
      return;
    }

    let mounted = true;
    setLoadingMembers(true);
    setMemberLoadError('');

    getGroupMembers(numericGroupId)
      .then(response => {
        if (!mounted) {
          return;
        }

        const nextMembers = response.result.map(member => ({
          id: String(member.userId),
          userId: member.userId,
          name: member.name?.trim() || `멤버 ${member.userId}`,
          profileUrl: member.profileImage ?? member.profileUrl ?? member.profileImg ?? null,
          isPaid: false,
        }));

        setSettlementMembers(nextMembers);
      })
      .catch((error: any) => {
        if (!mounted) {
          return;
        }

        setMemberLoadError(
          error?.response?.data?.message ||
            error?.message ||
            '정산 대상자 목록을 불러오지 못했습니다.',
        );
      })
      .finally(() => {
        if (mounted) {
          setLoadingMembers(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [isNewSettle, numericGroupId]);

  const selectableMembers = settlementMembers;
  const selectedParticipantIds = useMemo(
    () =>
      selectableMembers
        .filter(member => selectedIds.has(member.id))
        .map(member => member.userId),
    [selectableMembers, selectedIds],
  );

  const toggleMember = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === selectableMembers.length) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set(selectableMembers.map(member => member.id)));
  };

  const perPerson =
    selectedParticipantIds.length > 0
      ? Math.ceil(amount / selectedParticipantIds.length)
      : 0;
  const bottomInset = Math.max(insets.bottom, 12);
  const pageScrollContentStyle = useMemo(
    () => [styles.pageScrollContent, {paddingBottom: bottomInset + 24}],
    [bottomInset],
  );

  const navigateToCreatedSettlementDetail = (expenseId: number, receiptImageUrl?: string | null) => {
    const detailParams = {
      expenseId,
      amount,
      storeName: displayName.trim(),
      date: params.date,
      memo: memo.trim(),
      receiptUri: receiptImageUrl || (params.receiptUri as string | null),
      groupId: params.groupId,
      groupName,
    };

    const state = navigation.getState?.();
    const existingRoutes = Array.isArray(state?.routes) ? state.routes : [];
    const preservedRoutes = existingRoutes.filter(
      (route: {name?: string}) =>
        route.name !== 'SettlementReceiptOcr' && route.name !== 'SettleMemberSelect',
    );

    if (preservedRoutes.length === 0) {
      navigation.replace('SettleDetail', detailParams);
      return;
    }

    navigation.dispatch(
      CommonActions.reset({
        ...state,
        routes: [
          ...preservedRoutes,
          {
            name: 'SettleDetail',
            params: detailParams,
          },
        ],
        index: preservedRoutes.length,
      }),
    );
  };

  const handleRegister = () => {
    if (selectedParticipantIds.length === 0) {
      Alert.alert('안내', '정산할 인원을 선택하세요.');
      return;
    }

    if (!params.receiptDraft) {
      Alert.alert('안내', '검수된 영수증 데이터가 없습니다. OCR 검수부터 진행해 주세요.');
      return;
    }

    if (!params.receiptUri) {
      Alert.alert('안내', '영수증 스캔본이 없습니다. 영수증 이미지를 다시 선택해 주세요.');
      return;
    }

    if (!Number.isFinite(numericGroupId)) {
      Alert.alert('안내', '유효한 모임 ID가 없습니다.');
      return;
    }

    if (!displayName.trim()) {
      Alert.alert('안내', '표시명을 입력하세요.');
      return;
    }

    if (!receiverBankName.trim()) {
      Alert.alert('안내', '수취 은행명을 입력하세요.');
      return;
    }

    if (!receiverAccountNumber.trim()) {
      Alert.alert('안내', '수취 계좌번호를 입력하세요.');
      return;
    }

    Alert.alert(
      '정산 등록',
      `${displayName.trim()}\n금액: ${amount.toLocaleString()}원\n인원: ${selectedParticipantIds.length}명 (1인당 ${perPerson.toLocaleString()}원)\n\n등록하시겠습니까?`,
      [
        {text: '취소', style: 'cancel'},
        {
          text: '등록',
          onPress: async () => {
            try {
              setSubmitting(true);

              const response = await createSettlement({
                groupId: numericGroupId,
                imageUri: params.receiptUri as string,
                receipt: params.receiptDraft as ReceiptDraft,
                amount: perPerson,
                receiverBankName: receiverBankName.trim(),
                receiverAccountNumber: receiverAccountNumber.trim(),
                displayName: displayName.trim(),
                memo: memo.trim(),
                participants: selectedParticipantIds,
              });

              Alert.alert('완료', '정산 내역이 등록되었습니다.', [
                {
                  text: '확인',
                  onPress: () => {
                    navigateToCreatedSettlementDetail(
                      response.expenseId,
                      response.receiptImageUrl,
                    );
                  },
                },
              ]);
            } catch (error: any) {
              Alert.alert(
                '등록 실패',
                error?.response?.data?.message ||
                  error?.message ||
                  '정산 등록 중 오류가 발생했습니다.',
              );
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

  const [members] = useState<SettleMember[]>(params.settleMembers ?? FALLBACK_SETTLE_MEMBERS);

  const paidCount = members.filter(member => member.isPaid).length;
  const unpaidCount = members.filter(member => !member.isPaid).length;
  const existingPerPerson = members.length > 0 ? Math.ceil(amount / members.length) : 0;

  const onSendNotification = () => {
    const unpaidNames = members
      .filter(member => !member.isPaid)
      .map(member => member.name)
      .join(', ');

    if (unpaidCount === 0) {
      Alert.alert('안내', '모든 멤버가 납부 완료했습니다.');
      return;
    }

    Alert.alert(
      '미납자 알림 보내기',
      `${unpaidNames}에게 ${existingPerPerson.toLocaleString()}원 입금 요청 알림을 보냅니다.`,
      [
        {text: '취소', style: 'cancel'},
        {
          text: '보내기',
          onPress: async () => {
            const numericExpenseId = typeof params.expenseId === 'number' ? params.expenseId : NaN;

            if (!Number.isFinite(numericGroupId) || !Number.isFinite(numericExpenseId)) {
              Alert.alert('안내', '알림 전송에 필요한 정산 정보가 없습니다.');
              return;
            }

            try {
              setSendingReminder(true);
              const response = await sendSettlementReminder(
                numericGroupId,
                numericExpenseId,
              );
              Alert.alert(
                '완료',
                `알림 요청 ${response.requestedCount}건 중 ${response.sentCount}건을 전송했습니다.` +
                  (response.failedCount > 0 ? ` 실패 ${response.failedCount}건` : ''),
              );
            } catch (error: any) {
              Alert.alert(
                '알림 전송 실패',
                error?.response?.data?.message ||
                  error?.message ||
                  '미납자 알림 전송 중 오류가 발생했습니다.',
              );
            } finally {
              setSendingReminder(false);
            }
          },
        },
      ],
    );
  };

  // ═══════════════════════════════════════
  // 새 정산 등록 모드 UI
  // ═══════════════════════════════════════
  if (isNewSettle) {
    return (
      <ScreenLayout>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={pageScrollContentStyle}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-center justify-between mb-5">
            <Text style={styles.headerTitle}>정산 인원 선택</Text>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
              <Text style={styles.closeText}>닫기</Text>
            </Pressable>
          </View>

          <View
            className="bg-white rounded-3xl px-6 py-5 mb-5"
            style={styles.summaryCard}
          >
            <Text style={styles.summaryDate}>{params.date} · {params.storeName}</Text>
            <Text style={styles.summaryAmount}>-{amount.toLocaleString()}원</Text>
            {selectedParticipantIds.length > 0 && (
              <Text style={styles.summaryPerPerson}>
                1인당 {perPerson.toLocaleString()}원 · {selectedParticipantIds.length}명
              </Text>
            )}
          </View>

          {params.receiptUri ? (
            <View style={styles.receiptPreviewCard}>
              <Text style={styles.receiptPreviewTitle}>영수증 사진</Text>
              <Image
                source={{uri: params.receiptUri}}
                style={styles.receiptPreviewImage}
                resizeMode="cover"
              />
            </View>
          ) : null}

          <View style={styles.guideCard}>
            <Text style={styles.guideTitle}>정산 등록 안내</Text>
            <Text style={styles.guideText}>
              영수증 검수값을 바탕으로 표시명만 기본 입력했습니다. 메모와 입금 계좌를 확인한 뒤,
              정산을 요청할 인원을 선택하세요.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>정산 정보</Text>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>표시명</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="표시명"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
              <Text style={styles.helperText}>기본값은 영수증 매장명입니다.</Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>메모</Text>
              <TextInput
                value={memo}
                onChangeText={setMemo}
                placeholder="정산 메모"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>수취 은행명</Text>
              <TextInput
                value={receiverBankName}
                onChangeText={setReceiverBankName}
                placeholder="예: 부산은행"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>수취 계좌번호</Text>
              <TextInput
                value={receiverAccountNumber}
                onChangeText={handleReceiverAccountNumberChange}
                placeholder="예: 111-11111111-11"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                keyboardType="number-pad"
                maxLength={20}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.memberSectionCard}>
            <View style={styles.memberSectionHeader}>
              <View>
                <Text style={styles.memberSectionTitle}>정산 인원 선택</Text>
                <Text style={styles.memberSectionHelper}>
                  선택한 인원에게 1인당 {perPerson.toLocaleString()}원이 청구됩니다.
                </Text>
              </View>
              <View style={styles.selectionBadge}>
                <Text style={styles.selectionBadgeText}>{selectedParticipantIds.length}명 선택</Text>
              </View>
            </View>

            <Pressable onPress={selectAll} className="flex-row items-center mb-4" style={styles.selectAllRow}>
              <View style={[
                styles.checkbox,
                selectableMembers.length > 0 &&
                  selectedIds.size === selectableMembers.length &&
                  styles.checkboxSelected,
              ]}>
                <Text style={styles.checkMark}>✓</Text>
              </View>
              <Text style={styles.selectAllText}>전체 선택</Text>
            </Pressable>

            <View style={styles.memberListSection}>
              {loadingMembers ? (
                <View style={styles.statusCard}>
                  <ActivityIndicator color="#1428A0" />
                  <Text style={styles.statusText}>정산 대상자를 불러오는 중...</Text>
                </View>
              ) : memberLoadError ? (
                <View style={styles.statusCard}>
                  <Text style={styles.statusText}>{memberLoadError}</Text>
                </View>
              ) : selectableMembers.length === 0 ? (
                <View style={styles.statusCard}>
                  <Text style={styles.statusText}>선택할 수 있는 정산 대상자가 없습니다.</Text>
                </View>
              ) : (
                selectableMembers.map(member => {
                  const isSelected = selectedIds.has(member.id);
                  return (
                    <Pressable
                      key={member.id}
                      onPress={() => toggleMember(member.id)}
                      className="flex-row items-center"
                      style={[styles.newMemberRow, isSelected && styles.newMemberRowSelected]}
                    >
                      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        <Text style={styles.checkMark}>✓</Text>
                      </View>

                      <View
                        style={[
                          styles.newMemberAvatar,
                          isSelected && styles.newMemberAvatarSelected,
                        ]}>
                        <Image
                          source={getProfileImage(member.profileUrl)}
                          style={styles.memberAvatarImage}
                          resizeMode="cover"
                        />
                      </View>

                      <View style={styles.memberTextWrap}>
                        <Text
                          style={[
                            styles.newMemberName,
                            !isSelected && styles.newMemberNameInactive,
                          ]}>
                          {member.name}
                        </Text>
                        <Text style={styles.newMemberCaption}>
                          {isSelected ? '정산 요청 대상에 포함됨' : '탭해서 정산 요청 대상에 추가'}
                        </Text>
                      </View>

                      {isSelected && selectedParticipantIds.length > 0 ? (
                        <Text style={styles.perPersonAmount}>
                          {perPerson.toLocaleString()}원
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })
              )}
            </View>
          </View>

          <View style={[styles.bottomBar, {paddingBottom: bottomInset}]}>
            <Pressable
              onPress={handleRegister}
              disabled={
                selectedParticipantIds.length === 0 ||
                submitting ||
                loadingMembers ||
                !!memberLoadError
              }
              className="rounded-2xl py-4 items-center justify-center"
              style={[
                styles.registerButton,
                (selectedParticipantIds.length === 0 ||
                  submitting ||
                  loadingMembers ||
                  !!memberLoadError) && styles.registerButtonDisabled,
              ]}
            >
              <Text style={styles.registerButtonText}>
                {submitting
                  ? '정산 등록 중...'
                  : loadingMembers
                  ? '정산 대상자 불러오는 중...'
                  : selectedParticipantIds.length > 0
                  ? `정산 등록하기 (${selectedParticipantIds.length}명)`
                  : '인원을 선택하세요'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </ScreenLayout>
    );
  }

  // ═══════════════════════════════════════
  // 기존 정산 조회 모드 UI (미납자 확인 + 알림)
  // ═══════════════════════════════════════
  return (
    <ScreenLayout>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={pageScrollContentStyle}
      >
        <View className="flex-row items-center justify-between mb-5">
          <Text style={styles.headerTitle}>정산 현황</Text>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.closeText}>닫기</Text>
          </Pressable>
        </View>

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

        <View style={styles.memberListSection}>
          {[...members]
            .sort((a, b) => (a.isPaid === b.isPaid ? 0 : a.isPaid ? 1 : -1))
            .map(member => (
              <View
                key={member.id}
                className="flex-row items-center"
                style={styles.existingMemberRow}>
                <View
                  style={[
                    styles.existingMemberAvatar,
                    {
                      backgroundColor: member.isPaid ? '#F0FDF4' : '#FEF2F2',
                      borderColor: member.isPaid ? '#22C55E' : '#EF4444',
                    },
                  ]}>
                  <Image
                    source={getProfileImage(member.profileUrl)}
                    style={styles.memberAvatarImage}
                    resizeMode="cover"
                  />
                </View>

                <View style={styles.existingMemberInfo}>
                  <Text style={styles.existingMemberName}>{member.name}</Text>
                  <Text style={styles.existingMemberAmount}>
                    {existingPerPerson.toLocaleString()}원
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    {backgroundColor: member.isPaid ? '#22C55E' : '#EF4444'},
                  ]}>
                  <Text style={styles.statusBadgeText}>
                    {member.isPaid ? '완료' : '미납'}
                  </Text>
                </View>
              </View>
            ))}
        </View>

        <View style={[styles.bottomBar, {paddingBottom: bottomInset}]}>
          <Pressable
            onPress={onSendNotification}
            disabled={unpaidCount === 0 || sendingReminder}
            className="rounded-2xl py-4 items-center justify-center"
            style={[
              styles.notifyButton,
              (unpaidCount === 0 || sendingReminder) && styles.notifyButtonDone,
            ]}
          >
            <Text style={styles.notifyButtonText}>
              {sendingReminder
                ? '알림 전송 중...'
                : unpaidCount > 0
                ? `미납자 ${unpaidCount}명에게 알림 보내기`
                : '전원 납부 완료'}
            </Text>
          </Pressable>
        </View>

      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  receiptPreviewCard: {
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  receiptPreviewTitle: {
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 12,
  },
  receiptPreviewImage: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
  },
  pageScrollContent: {
    paddingBottom: 24,
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
    lineHeight: 36,
    fontFamily: FONT_FAMILY.bold,
    paddingVertical: 2,
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
  guideCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  guideTitle: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.brand,
    marginBottom: 6,
  },
  guideText: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.subtle,
    fontFamily: FONT_FAMILY.medium,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  formTitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
    marginBottom: 12,
  },
  formField: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.dark,
    fontSize: 15,
    fontFamily: FONT_FAMILY.medium,
    backgroundColor: '#F9FAFB',
  },
  helperText: {
    fontSize: 12,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
    marginTop: 6,
  },
  summaryRowLabel: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },
  summaryTotalAmount: {
    fontSize: 22,
    lineHeight: 30,
    fontFamily: FONT_FAMILY.bold,
    paddingVertical: 1,
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
  memberSectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  memberSectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 12,
  },
  memberSectionTitle: {
    fontSize: 16,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 4,
  },
  memberSectionHelper: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },
  selectionBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectionBadgeText: {
    fontSize: 12,
    color: COLORS.brand,
    fontFamily: FONT_FAMILY.bold,
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
  memberListSection: {
    gap: 12,
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    textAlign: 'center',
  },

  // ── 새 정산 멤버 행 ───────────────────────
  newMemberRow: {
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  newMemberRowSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
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
    overflow: 'hidden',
  },
  newMemberAvatarSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#1428A0',
  },
  memberAvatarImage: {
    width: '100%',
    height: '100%',
  },
  newMemberName: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
  },
  memberTextWrap: {
    flex: 1,
  },
  newMemberNameInactive: {
    color: COLORS.placeholder,
  },
  newMemberCaption: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    marginTop: 3,
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
    overflow: 'hidden',
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
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 16,
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
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
