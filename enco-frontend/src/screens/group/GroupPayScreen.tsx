// src/screens/group/GroupPayScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { GroupStackParamList } from '../../navigation/GroupStackNavigator';

type Props = NativeStackScreenProps<GroupStackParamList, 'GroupPay'>;

type Step = 'summary' | 'form' | 'pin' | 'success';

const PIN_LEN = 6;

const formatKRW = (n: number) => `₩ ${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

export default function GroupPayScreen({ navigation, route }: Props) {
  const groupId = route.params?.groupId;
  const groupName = route.params?.groupName ?? '모임명';

  // ====== 임시 데이터(나중에 API로 교체) ======
  const monthlyDue = 10000;

  const accounts = useMemo(
    () => [
      { id: 'a1', name: '우리은행 110-****-1234' },
      { id: 'a2', name: '국민은행 012-****-5678' },
    ],
    []
  );

  // ====== 화면 상태 ======
  const [step, setStep] = useState<Step>('summary');

  // 폼 값
  const [amountText, setAmountText] = useState<string>(String(monthlyDue));
  const [accountIndex, setAccountIndex] = useState<number>(0);
  const [senderLabel, setSenderLabel] = useState<string>('내통장 표시(임시)');
  const [receiverLabel, setReceiverLabel] = useState<string>('받는분 표시(임시)');
  const [memo, setMemo] = useState<string>('회비 납부');

  // PIN
  const [pin, setPin] = useState<string>('');

  // PIN 6자리 입력 완료 시 success로
  useEffect(() => {
    if (step !== 'pin') return;
    if (pin.length === PIN_LEN) {
      // 임시로 즉시 완료 처리
      setTimeout(() => {
        setStep('success');
      }, 250);
    }
  }, [pin, step]);

  const selectedAccount = accounts[accountIndex]?.name ?? '계좌 선택';

  const goBackLike = () => {
    if (step === 'summary') {
      navigation.goBack();
      return;
    }
    if (step === 'form') {
      setStep('summary');
      return;
    }
    if (step === 'pin') {
      setPin('');
      setStep('form');
      return;
    }
    if (step === 'success') {
      // 완료 화면에서 뒤로는 요약으로
      setPin('');
      setStep('summary');
      return;
    }
  };

  // ====== 액션 ======
  const onPressPayStart = () => {
    setStep('form');
  };

  const onPressSubmitTransfer = () => {
    const parsed = parseInt(amountText.replace(/[^0-9]/g, ''), 10);

    if (!parsed || parsed <= 0) {
      Alert.alert('확인', '금액을 입력해주세요.');
      return;
    }
    if (!selectedAccount || selectedAccount === '계좌 선택') {
      Alert.alert('확인', '계좌를 선택해주세요.');
      return;
    }
    // PIN 단계 진입
    setPin('');
    setStep('pin');
  };

  const onPressNotify = () => {
    Alert.alert('알림', 'TODO: 송금 완료 알림 보내기');
    // 필요하면 모임 대시보드로 복귀:
    setPin('');
    setStep('summary');
  };

  // ====== PIN 키패드 ======
  const appendPin = (digit: string) => {
    if (pin.length >= PIN_LEN) return;
    setPin(prev => prev + digit);
  };

  const backspacePin = () => {
    setPin(prev => prev.slice(0, -1));
  };

  // ====== 렌더 ======
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.container}>
        {/* 공통 Header */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {groupName}
            </Text>
            <Text style={styles.headerInfo}>ⓘ</Text>
          </View>

          <Pressable onPress={goBackLike} hitSlop={12} style={styles.headerRightBtn}>
            <Text style={styles.headerRightText}>
              {step === 'summary' ? '닫기' : '뒤로'}
            </Text>
          </Pressable>
        </View>

        {step === 'summary' && (
          <View style={{ marginTop: 16 }}>
            <View style={styles.bigCard}>
              <Text style={styles.bigCardText}>우리 은행에 계좌가 있다고 가정</Text>
              <Text style={[styles.bigCardText, { marginTop: 8 }]}>
                이번달에 납부할 회비는 {formatKRW(monthlyDue)} 입니다
              </Text>
            </View>

            <Pressable onPress={onPressPayStart} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>납부하기</Text>
            </Pressable>
          </View>
        )}

        {step === 'form' && (
          <View style={{ marginTop: 16, gap: 14 }}>
            {/* 금액 */}
            <View style={styles.formBox}>
              <Text style={styles.formLabel}>금액</Text>
              <TextInput
                value={amountText}
                onChangeText={setAmountText}
                keyboardType="number-pad"
                placeholder="금액 입력"
                placeholderTextColor="#6B7280"
                style={styles.formInput}
              />
            </View>

            {/* 계좌 선택 */}
            <Pressable
              onPress={() => setAccountIndex(i => (i + 1) % accounts.length)}
              style={styles.formBox}
            >
              <Text style={styles.formLabel}>계좌 선택</Text>
              <Text style={styles.formValue}>{selectedAccount}</Text>
              <Text style={styles.formHint}>눌러서 계좌 변경(임시)</Text>
            </Pressable>

            {/* 내통장 표시 */}
            <View style={styles.formBox}>
              <Text style={styles.formLabel}>내통장 표시</Text>
              <TextInput
                value={senderLabel}
                onChangeText={setSenderLabel}
                placeholder="내통장 표시"
                placeholderTextColor="#6B7280"
                style={styles.formInput}
              />
            </View>

            {/* 받는분 표시 */}
            <View style={styles.formBox}>
              <Text style={styles.formLabel}>받는분 표시</Text>
              <TextInput
                value={receiverLabel}
                onChangeText={setReceiverLabel}
                placeholder="받는분 표시"
                placeholderTextColor="#6B7280"
                style={styles.formInput}
              />
            </View>

            {/* 메모 */}
            <View style={styles.formBox}>
              <Text style={styles.formLabel}>메모</Text>
              <TextInput
                value={memo}
                onChangeText={setMemo}
                placeholder="메모"
                placeholderTextColor="#6B7280"
                style={styles.formInput}
              />
            </View>

            <Pressable onPress={onPressSubmitTransfer} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>송금하기</Text>
            </Pressable>
          </View>
        )}

        {step === 'pin' && (
          <View style={{ flex: 1, marginTop: 22 }}>
            <Text style={styles.pinTitle}>비밀번호를 입력해주세요</Text>

            {/* PIN dots */}
            <View style={styles.pinDotsRow}>
              {Array.from({ length: PIN_LEN }).map((_, idx) => {
                const filled = idx < pin.length;
                return (
                  <View
                    key={idx}
                    style={[styles.pinDot, filled && styles.pinDotFilled]}
                  />
                );
              })}
            </View>

            {/* keypad */}
            <View style={styles.keypad}>
              {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map((k) => {
                const isBack = k === '⌫';
                const isDot = k === '.';

                return (
                  <Pressable
                    key={k}
                    onPress={() => {
                      if (isBack) backspacePin();
                      else if (isDot) return; // '.'은 사용 안 함(와이어프레임만)
                      else appendPin(k);
                    }}
                    style={styles.keyBtn}
                  >
                    <Text style={styles.keyText}>{k}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {step === 'success' && (
          <View style={{ flex: 1, marginTop: 60, alignItems: 'center' }}>
            <Text style={styles.successTitle}>송금 완료되었습니다</Text>

            <Pressable onPress={onPressNotify} style={[styles.primaryBtn, { marginTop: 20, width: 220 }]}>
              <Text style={styles.primaryBtnText}>송금완료 알람보내기</Text>
            </Pressable>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 18, paddingTop: 18 },

  headerBar: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, paddingRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#111827', flexShrink: 1 },
  headerInfo: { fontSize: 16, color: '#6B7280' },
  headerRightBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  headerRightText: { fontSize: 16, fontWeight: '800' },

  bigCard: {
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 18,
    paddingVertical: 22,
    minHeight: 150,
    justifyContent: 'center',
  },
  bigCardText: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'center', lineHeight: 22 },

  primaryBtn: {
    marginTop: 16,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { fontSize: 16, fontWeight: '900' },

  formBox: {
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  formLabel: { fontSize: 14, fontWeight: '900', marginBottom: 10, color: '#111827' },
  formInput: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#111827',
  },
  formValue: { fontSize: 15, fontWeight: '700', color: '#111827' },
  formHint: { marginTop: 6, fontSize: 12, color: '#6B7280' },

  pinTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginTop: 20 },
  pinDotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 26 },
  pinDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#D1D5DB' },
  pinDotFilled: { backgroundColor: '#6B7280' },

  keypad: {
    marginTop: 26,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  keyBtn: {
    width: '30%',
    height: 54,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { fontSize: 18, fontWeight: '800' },

  successTitle: { fontSize: 22, fontWeight: '900' },
});