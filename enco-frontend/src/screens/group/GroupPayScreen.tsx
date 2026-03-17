// src/screens/group/GroupPayScreen.tsx
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  ScrollView,
} from 'react-native';
import ScreenLayout from '../../components/ScreenLayout';
import PinEntry from '../../components/pin/PinEntry';
import { GroupPayStep, GroupProps } from '../../types/group';

const formatKRW = (n: number) =>
  `${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원`;

const formatInputNumber = (value: string) => value.replace(/[^0-9]/g, '');

type UnpaidItem = {
  id: string;
  label: string;
  amount: number;
};

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

function InfoDisplayBox({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: object;
}) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueStyle]}>{value}</Text>
    </View>
  );
}


export default function GroupPayScreen({
  navigation,
  route,
}: GroupProps<'GroupPay'>) {
  const [step, setStep] = useState<GroupPayStep>('summary');
  const [pinResetKey, setPinResetKey] = useState(0);

  const unpaidItems = useMemo<UnpaidItem[]>(
    () => [
      { id: 'u1', label: '26.3.1 3월 회비', amount: 10000 },
      { id: 'u2', label: '26.2.1 2월 회비', amount: 10000 },
      { id: 'u3', label: '26.1.1 1월 회비', amount: 10000 },
    ],
    []
  );

  const [selectedUnpaidIds, setSelectedUnpaidIds] = useState<string[]>([]);
  const [amountText, setAmountText] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState('부산은행 112');
  const [myAccountLabel, setMyAccountLabel] = useState('');
  const [groupAccountLabel, setGroupAccountLabel] = useState('');
  const [memo, setMemo] = useState('');

  const resetConfirmInputs = useCallback(() => {
    setSelectedAccount('부산은행 112');
    setMyAccountLabel('');
    setGroupAccountLabel('');
    setMemo('');
  }, []);

  const parsedAmount = useMemo(() => {
    const parsed = parseInt(formatInputNumber(amountText), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [amountText]);

  const goBackLike = useCallback(() => {
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
      setStep('summary');
      return;
    }
  }, [navigation, resetConfirmInputs, step]);

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
    setSelectedUnpaidIds(prev => {
      const isSelected = prev.includes(item.id);

      const nextIds = isSelected
        ? prev.filter(id => id !== item.id)
        : [...prev, item.id];

      const nextAmount = unpaidItems
        .filter(unpaid => nextIds.includes(unpaid.id))
        .reduce((sum, unpaid) => sum + unpaid.amount, 0);

      setAmountText(nextAmount > 0 ? String(nextAmount) : '');

      return nextIds;
    });
  };

  const onChangeAmount = (text: string) => {
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

  const onPressNotify = () => {
    Alert.alert('알림', 'TODO: 송금 완료 알림 보내기');
    setStep('summary');
    setSelectedUnpaidIds([]);
    setAmountText('');
    resetConfirmInputs();
  };

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
                    {parsedAmount > 0 ? formatKRW(parsedAmount) : ''}
                  </Text>
                  {parsedAmount > 0 && <View style={styles.heroUnderline} />}
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
                />
                <Text style={styles.amountUnit}>원</Text>
              </View>

              <Text style={[styles.sectionLabel, { marginTop: 28 }]}>
                미납 금액
              </Text>

              <View style={styles.unpaidList}>
                {unpaidItems.map(item => {
                  const selected = selectedUnpaidIds.includes(item.id);

                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => onPressUnpaidItem(item)}
                      style={[
                        styles.unpaidItem,
                        selected && styles.unpaidItemSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.unpaidItemLabel,
                          selected && styles.unpaidItemTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text
                        style={[
                          styles.unpaidItemAmount,
                          selected && styles.unpaidItemTextSelected,
                        ]}
                      >
                        {formatKRW(item.amount)}
                      </Text>
                    </Pressable>
                  );
                })}
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

            <InfoDisplayBox
              label="계좌 선택"
              value={selectedAccount}
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

            <InfoInputBox
              label="메모"
              value={memo}
              onChangeText={setMemo}
            />

            <Pressable onPress={onPressGoPin} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>납부하기</Text>
            </Pressable>
          </View>
        )}

        {step === 'pin' && (
          <PinEntry
            title="비밀번호를 입력해주세요"
            length={4}
            resetKey={pinResetKey}
            onComplete={() => {
              setStep('success');
            }}
          />
        )}

        {step === 'success' && (
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>송금 완료되었습니다</Text>

            <Pressable
              onPress={onPressNotify}
              style={[styles.primaryBtn, styles.successButton]}
            >
              <Text style={styles.primaryBtnText}>송금완료 알림보내기</Text>
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
    color: '#374151',
    fontFamily: 'GmarketSansTTFMedium',
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
    color: '#111111',
    fontFamily: 'GmarketSansTTFBold',
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
    color: '#1428A0',
    fontFamily: 'GmarketSansTTFBold',
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
    fontFamily: 'GmarketSansTTFMedium',
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
    color: '#111111',
    fontFamily: 'GmarketSansTTFMedium',
    textAlign: 'right',
  },
  amountUnit: {
    marginLeft: 10,
    fontSize: 18,
    color: '#444444',
    fontFamily: 'GmarketSansTTFMedium',
  },

  unpaidList: {
    marginTop: 14,
    gap: 14,
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
    fontFamily: 'GmarketSansTTFMedium',
  },
  unpaidItemAmount: {
    fontSize: 18,
    color: '#FF5A5A',
    fontFamily: 'GmarketSansTTFBold',
  },
  unpaidItemTextSelected: {
    color: '#FF3B30',
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
    color: '#111111',
    fontFamily: 'GmarketSansTTFBold',
  },
  infoValue: {
    fontSize: 18,
    color: '#666666',
    fontFamily: 'GmarketSansTTFMedium',
    maxWidth: '62%',
    textAlign: 'right',
  },
  infoInput: {
    flex: 1,
    marginLeft: 16,
    fontSize: 18,
    color: '#666666',
    fontFamily: 'GmarketSansTTFMedium',
    textAlign: 'right',
    paddingVertical: 0,
  },
  amountConfirmValue: {
    fontSize: 24,
    color: '#111111',
    fontFamily: 'GmarketSansTTFBold',
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
    color: '#ffffff',
    fontFamily: 'GmarketSansTTFMedium',
  },

  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  successTitle: {
    fontSize: 22,
    color: '#111111',
    fontFamily: 'GmarketSansTTFBold',
    textAlign: 'center',
  },
  successButton: {
    width: 220,
  },
});