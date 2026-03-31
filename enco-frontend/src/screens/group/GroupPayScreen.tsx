// src/screens/group/GroupPayScreen.tsx
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Alert,
  Pressable,
  TextInput,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  ScrollView,
} from 'react-native';
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';
import ScreenLayout from '../../components/ScreenLayout';
import PinEntry from '../../components/pin/PinEntry';
import { GroupPayStep, GroupProps } from '../../types/group';
import { SelectedAccount } from '../../types/payment';
import {
  duesPayment,
  getUnpaidDues,
  selectedDuesPayment,
  type UnpaidItem,
} from '../../services/paymentService';

const PIN_LEN = 4;

const formatKRW = (n: number) =>
  `${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원`;

const formatAmountNumber = (n: number) =>
  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const formatInputNumber = (value: string) => value.replace(/[^0-9]/g, '');

function InfoInputBox({
  label,
  value,
  onChangeText,
  keyboardType,
  valueStyle,
}: {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'number-pad';
  valueStyle?: object;
}) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoLabel}>{label}</Text>

      {onChangeText ? (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder=""
          placeholderTextColor="#9CA3AF"
          style={[styles.infoInput, valueStyle]}
        />
      ) : (
        <Text style={[styles.infoValue, valueStyle]}>{value}</Text>
      )}
    </View>
  );
}

export default function GroupPayScreen({
  navigation,
  route,
}: GroupProps<'GroupPay'>) {
  const groupIdParam = route.params?.groupId;
  const presetAmount = route.params?.presetAmount;
  const presetMemo = route.params?.presetMemo ?? '';
  const paySource = route.params?.paySource ?? 'default';
  const presetUnpaidId = route.params?.presetUnpaidId;

  const DEFAULT_ACCOUNT: SelectedAccount = {
    bankName: '부산은행',
    accountNumber: '111-1111-1111-11',
    label: '부산은행 111-1111-1111-11',
  };

  // useState는 한 구간에 몰아서 선언
  const [step, setStep] = useState<GroupPayStep>('summary');
  const [pinResetKey, setPinResetKey] = useState(0);
  const [isSettlementLocked, setIsSettlementLocked] = useState(
    paySource === 'settlement',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUnpaidIds, setSelectedUnpaidIds] = useState<string[]>(
    presetUnpaidId ? [presetUnpaidId] : [],
  );
  const [amountText, setAmountText] = useState<string>(
    presetAmount ? String(presetAmount) : '',
  );
  const [selectedAccount, setSelectedAccount] =
    useState<SelectedAccount>(DEFAULT_ACCOUNT);
  const [myAccountLabel, setMyAccountLabel] = useState('');
  const [groupAccountLabel, setGroupAccountLabel] = useState('');
  const [memo, setMemo] = useState(presetMemo);
  const [unpaidItems, setUnpaidItems] = useState<UnpaidItem[]>([]);
  const [isLoadingUnpaidItems, setIsLoadingUnpaidItems] = useState(false);
  const [unpaidLoadError, setUnpaidLoadError] = useState('');

  const numericGroupId = useMemo(() => {
    if (!groupIdParam) return NaN;
    return Number(groupIdParam);
  }, [groupIdParam]);

  const selectedChargeTargetIds = useMemo(
    () =>
      unpaidItems
        .filter(item => selectedUnpaidIds.includes(String(item.chargeTargetId)))
        .map(item => item.chargeTargetId),
    [selectedUnpaidIds, unpaidItems],
  );

  const parsedAmount = useMemo(() => {
    const parsed = parseInt(formatInputNumber(amountText), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [amountText]);

  useEffect(() => {
    if (!Number.isFinite(numericGroupId)) {
      setUnpaidItems([]);
      setUnpaidLoadError(groupIdParam ? '모임 정보를 확인할 수 없습니다.' : '');
      setIsLoadingUnpaidItems(false);
      return;
    }

    let isMounted = true;

    const fetchUnpaidItems = async () => {
      try {
        setIsLoadingUnpaidItems(true);
        setUnpaidLoadError('');

        const response = await getUnpaidDues(numericGroupId);
        const nextItems = response.result.charges ?? [];

        if (!isMounted) return;
        setUnpaidItems(nextItems);
      } catch (error) {
        if (!isMounted) return;
        console.error('[GetUnpaidDues] failed:', error);
        setUnpaidItems([]);
        setUnpaidLoadError('미납 내역을 불러오지 못했습니다.');
      } finally {
        if (isMounted) {
          setIsLoadingUnpaidItems(false);
        }
      }
    };

    fetchUnpaidItems();

    return () => {
      isMounted = false;
    };
  }, [groupIdParam, numericGroupId]);

  useEffect(() => {
    if (isSettlementLocked || selectedUnpaidIds.length === 0) return;

    const nextAmount = unpaidItems
      .filter(unpaid =>
        selectedUnpaidIds.includes(String(unpaid.chargeTargetId)),
      )
      .reduce((sum, unpaid) => sum + unpaid.remainingAmount, 0);

    setAmountText(nextAmount > 0 ? String(nextAmount) : '');
  }, [isSettlementLocked, selectedUnpaidIds, unpaidItems]);

  const resetConfirmInputs = useCallback(() => {
    setSelectedAccount(DEFAULT_ACCOUNT);
    setMyAccountLabel('');
    setGroupAccountLabel('');
    setMemo(presetMemo);
  }, [presetMemo]);

  const resetAllPayState = useCallback(() => {
    setSelectedUnpaidIds([]);
    setAmountText('');
    setSelectedAccount(DEFAULT_ACCOUNT);
    setMyAccountLabel('');
    setGroupAccountLabel('');
    setMemo('');
    setPinResetKey(prev => prev + 1);
    setIsSettlementLocked(false);
    setIsSubmitting(false);
  }, []);

  const goBackLike = useCallback(() => {
    if (isSubmitting) return;

    if (step === 'summary') {
      navigation.goBack();
      return;
    }
    if (step === 'form') {
      resetConfirmInputs();
      setStep('summary');
      return;
    }
    if (step === 'pin') {
      setStep('form');
      return;
    }
    if (step === 'success') {
      resetAllPayState();
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'GroupDashboard',
            params: {
              groupId: route.params?.groupId,
              groupName: route.params?.groupName,
              isAdmin: route.params?.isAdmin,
            },
          },
        ],
      });
      return;
    }
  }, [navigation, resetConfirmInputs, resetAllPayState, step, isSubmitting]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step !== 'summary') {
        goBackLike();
        return true;
      }
      return false;
    });

    return () => sub.remove();
  }, [goBackLike, step]);

  const onPressUnpaidItem = (item: UnpaidItem) => {
    if (isSettlementLocked) return;

    setSelectedUnpaidIds(prev => {
      const itemId = String(item.chargeTargetId);
      const isSelected = prev.includes(itemId);
      const nextIds = isSelected
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];

      const nextAmount = unpaidItems
        .filter(unpaid => nextIds.includes(String(unpaid.chargeTargetId)))
        .reduce((sum, unpaid) => sum + unpaid.remainingAmount, 0);

      setAmountText(nextAmount > 0 ? String(nextAmount) : '');
      return nextIds;
    });
  };

  const onChangeAmount = (text: string) => {
    if (isSettlementLocked) return;
    setSelectedUnpaidIds([]);
    setAmountText(formatInputNumber(text));
  };

  const onPressGoConfirm = () => {
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('확인', '금액을 입력해주세요.');
      return;
    }
    resetConfirmInputs();
    setStep('form');
  };

  const onPressGoPin = () => {
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('확인', '금액을 입력해주세요.');
      return;
    }
    setPinResetKey(prev => prev + 1);
    setStep('pin');
  };

  const handleSubmitPayment = async () => {
    if (isSubmitting) return;

    if (!Number.isFinite(numericGroupId)) {
      Alert.alert('오류', '유효하지 않은 모임 ID입니다.');
      return;
    }

    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('확인', '금액을 입력해주세요.');
      return;
    }

    const requestBody = {
      withdrawAccountBankName: selectedAccount.bankName,
      withdrawAccountNumber: selectedAccount.accountNumber,
      amount: parsedAmount,
      withdrawDisplayName: myAccountLabel || '모임비 납부',
      depositDisplayName:
        groupAccountLabel || `${route.params?.groupName ?? '모임'} 통장`,
      memo: memo || '',
    };

    try {
      setIsSubmitting(true);

      console.log('[DuesPayment] submit start');
      console.log('[DuesPayment] groupId:', numericGroupId);
      console.log('[DuesPayment] requestBody:', requestBody);

      const result =
        selectedChargeTargetIds.length > 0
          ? await selectedDuesPayment(numericGroupId, {
              amount: parsedAmount,
              targetChargeTargetIds: selectedChargeTargetIds,
              withdrawDisplayName: requestBody.withdrawDisplayName,
              depositDisplayName: requestBody.depositDisplayName,
              memo: requestBody.memo,
            })
          : await duesPayment(numericGroupId, requestBody);

      console.log('[DuesPayment] success response:', result);
      console.log('[DuesPayment] paymentId:', result.result.paymentId);
      console.log('[DuesPayment] paidAt:', result.result.paidAt);
      console.log('[DuesPayment] allocations:', result.result.allocations);

      setStep('success');
    } catch (error: unknown) {
      console.error('[DuesPayment] failed:', error);
      console.error(
        '[DuesPayment] status:',
        (error as { response?: { status?: number } })?.response?.status,
      );
      console.error(
        '[DuesPayment] data:',
        (error as { response?: { data?: unknown } })?.response?.data,
      );

      setStep('form');
      setPinResetKey(prev => prev + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPressSuccess = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'GroupDashboard',
          params: {
            groupId: route.params?.groupId,
            groupName: route.params?.groupName,
            isAdmin: route.params?.isAdmin,
          },
        },
      ],
    });
  };

  // PIN 입력 화면은 다른 PIN 화면과 동일하게 full-screen으로 렌더
  if (step === 'pin') {
    return (
      <PinEntry
        title={isSubmitting ? '납부 처리 중입니다' : '비밀번호를\n입력해주세요'}
        length={PIN_LEN}
        resetKey={pinResetKey}
        onComplete={handleSubmitPayment}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScreenLayout>
        <View style={styles.headerSimple}>
          <Pressable onPress={goBackLike} hitSlop={12}>
            <Text style={styles.closeText}>
              {step === 'summary' ? '닫기' : '뒤로'}
            </Text>
          </Pressable>
        </View>

        {step === 'summary' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
          >
            <View style={styles.heroCard}>
              <Text style={styles.heroLine}>모임통장으로</Text>
              <View style={styles.heroAmountRow}>
                <View style={styles.heroUnderlineWrap}>
                  <Text style={styles.heroAmount}>
                    {formatAmountNumber(parsedAmount)}
                  </Text>
                  <View style={styles.heroUnderline} />
                </View>
                <Text style={styles.heroLine}>원 입금합니다</Text>
              </View>
            </View>

            <View style={styles.payCard}>
              <Text style={styles.sectionLabel}>금액 직접 입력</Text>

              <View style={styles.amountInputRow}>
                <TextInput
                  value={amountText}
                  onChangeText={onChangeAmount}
                  keyboardType="number-pad"
                  placeholder=""
                  placeholderTextColor="#9CA3AF"
                  style={styles.amountInput}
                  editable={!isSettlementLocked}
                />
                <Text style={styles.amountUnit}>원</Text>
              </View>

              <Text style={[styles.sectionLabel, { marginTop: 28 }]}>
                미납 금액
              </Text>

              <View style={styles.unpaidList}>
                {isLoadingUnpaidItems ? (
                  <Text style={styles.unpaidStateText}>
                    미납 내역을 불러오는 중입니다.
                  </Text>
                ) : unpaidLoadError ? (
                  <Text style={styles.unpaidStateText}>{unpaidLoadError}</Text>
                ) : unpaidItems.length === 0 ? (
                  <Text style={styles.unpaidStateText}>
                    미납 내역이 없습니다.
                  </Text>
                ) : (
                  unpaidItems.map(item => {
                    const selected = selectedUnpaidIds.includes(
                      String(item.chargeTargetId),
                    );

                    return (
                      <Pressable
                        key={item.chargeTargetId}
                        onPress={() => onPressUnpaidItem(item)}
                        style={[
                          styles.unpaidItem,
                          selected && styles.unpaidItemSelected,
                          isSettlementLocked && { opacity: 0.45 },
                        ]}
                        disabled={isSettlementLocked}
                      >
                        <Text
                          style={[
                            styles.unpaidItemLabel,
                            selected && styles.unpaidItemTextSelected,
                          ]}
                        >
                          {item.displayName}
                        </Text>
                        <Text
                          style={[
                            styles.unpaidItemAmount,
                            selected && styles.unpaidItemTextSelected,
                          ]}
                        >
                          {formatKRW(item.remainingAmount)}
                        </Text>
                      </Pressable>
                    );
                  })
                )}
              </View>

              <Pressable
                onPress={onPressGoConfirm}
                style={[
                  styles.primaryBtn,
                  parsedAmount <= 0 && styles.primaryBtnDisabled,
                ]}
                disabled={parsedAmount <= 0}
              >
                <Text style={styles.primaryBtnText}>납부하기</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}

        {step === 'form' && (
          <View style={styles.confirmContainer}>
            <InfoInputBox
              label="금액"
              value={
                parsedAmount > 0
                  ? amountText.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  : ''
              }
              valueStyle={styles.amountConfirmValue}
            />

            <InfoInputBox
              label="계좌 선택"
              value={selectedAccount.label}
              onChangeText={text =>
                setSelectedAccount(prev => ({ ...prev, label: text }))
              }
            />

            <InfoInputBox
              label="내통장 표시"
              value={myAccountLabel}
              onChangeText={setMyAccountLabel}
            />

            <InfoInputBox
              label="모임통장 표시"
              value={groupAccountLabel}
              onChangeText={setGroupAccountLabel}
            />

            <InfoInputBox label="메모" value={memo} onChangeText={setMemo} />

            <Pressable
              onPress={onPressGoPin}
              style={[
                styles.primaryBtn,
                isSubmitting && styles.primaryBtnDisabled,
              ]}
              disabled={isSubmitting}
            >
              <Text style={styles.primaryBtnText}>
                {isSubmitting ? '처리 중...' : '납부하기'}
              </Text>
            </Pressable>
          </View>
        )}

        {step === 'success' && (
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>
              {parsedAmount > 0
                ? `${formatKRW(parsedAmount)} 입금 완료 !`
                : '입금 완료 !'}
            </Text>

            <Pressable
              onPress={onPressSuccess}
              style={[styles.primaryBtn, styles.successButton]}
            >
              <Text style={styles.primaryBtnText}>확인</Text>
            </Pressable>
          </View>
        )}
      </ScreenLayout>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerSimple: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 15,
    color: COLORS.subtle,
    fontFamily: FONT_FAMILY.medium,
  },

  heroCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroLine: {
    fontSize: 20,
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
    textAlign: 'center',
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 2,
  },
  heroUnderlineWrap: {
    alignItems: 'center',
    marginRight: 6,
    minWidth: 88,
  },
  heroAmount: {
    fontSize: 20,
    color: COLORS.brand,
    fontFamily: FONT_FAMILY.bold,
    textAlign: 'center',
  },
  heroUnderline: {
    width: 84,
    height: 2,
    backgroundColor: '#1428A0',
    marginTop: 4,
  },

  payCard: {
    marginTop: 18,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 15,
    color: '#444444',
    fontFamily: FONT_FAMILY.medium,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  amountInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#111111',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.medium,
    textAlign: 'right',
  },
  amountUnit: {
    marginLeft: 10,
    fontSize: 18,
    color: '#444444',
    fontFamily: FONT_FAMILY.medium,
  },

  unpaidList: {
    marginTop: 14,
    gap: 14,
  },
  unpaidStateText: {
    fontSize: 14,
    color: COLORS.subtle,
    fontFamily: FONT_FAMILY.medium,
  },
  unpaidItem: {
    minHeight: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF5A5A',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  unpaidItemSelected: {
    backgroundColor: '#FFF0F0',
  },
  unpaidItemLabel: {
    fontSize: 12,
    color: '#FF5A5A',
    fontFamily: FONT_FAMILY.medium,
  },
  unpaidItemAmount: {
    fontSize: 18,
    color: '#FF5A5A',
    fontFamily: FONT_FAMILY.bold,
  },
  unpaidItemTextSelected: {
    color: COLORS.danger,
  },

  confirmContainer: {
    flex: 1,
    marginTop: 16,
    gap: 12,
  },
  infoBox: {
    minHeight: 86,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
  },
  infoValue: {
    fontSize: 18,
    color: COLORS.secondary,
    fontFamily: FONT_FAMILY.medium,
    maxWidth: '62%',
    textAlign: 'right',
  },
  infoInput: {
    flex: 1,
    marginLeft: 16,
    fontSize: 18,
    color: COLORS.secondary,
    fontFamily: FONT_FAMILY.medium,
    textAlign: 'right',
    paddingVertical: 0,
  },
  amountConfirmValue: {
    fontSize: 24,
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
    textAlign: 'right',
  },

  primaryBtn: {
    marginTop: 22,
    height: 50,
    borderRadius: 18,
    backgroundColor: '#1428A0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    fontSize: 18,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },

  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  successTitle: {
    fontSize: 22,
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
    textAlign: 'center',
  },
  successButton: {
    width: 220,
  },
});
