// src/screens/group/GroupPayScreen.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
} from 'react-native';
import ScreenLayout from '../../components/ScreenLayout';
import { GroupPayStep, GroupProps } from '../../types/group';

const PIN_LEN = 6;

const formatKRW = (n: number) =>
  `₩ ${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

export default function GroupPayScreen({ navigation, route }: GroupProps<'GroupPay'>) {
  const groupName = route.params?.groupName ?? '모임명';

  const monthlyDue = 10000;

  const accounts = useMemo(
    () => [
      { id: 'a1', name: '우리은행 110-****-1234' },
      { id: 'a2', name: '국민은행 012-****-5678' },
    ],
    []
  );

  const [step, setStep] = useState<GroupPayStep>('summary');

  const [amountText, setAmountText] = useState<string>(String(monthlyDue));
  const [accountIndex, setAccountIndex] = useState<number>(0);
  const [memo, setMemo] = useState<string>('회비 납부');

  const [pin, setPin] = useState<string>('');

  useEffect(() => {
    if (step !== 'pin') return;
    if (pin.length === PIN_LEN) {
      const t = setTimeout(() => setStep('success'), 250);
      return () => clearTimeout(t);
    }
  }, [pin, step]);

  const selectedAccount = accounts[accountIndex]?.name ?? '계좌 선택';

  // ✅ step 기반 뒤로가기 로직(헤더 버튼 + 하드웨어 백에서 같이 사용)
  const goBackLike = useCallback(() => {
    if (step === 'summary') {
      navigation.goBack(); // summary에서는 스크린 pop이 정상
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
      setPin('');
      setStep('summary');
      return;
    }
  }, [navigation, step]);

  // ✅ 안드로이드 하드웨어 뒤로가기 가로채기
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      // summary가 아니면 스크린 pop을 막고 내부 step만 뒤로 이동
      if (step !== 'summary') {
        goBackLike();
        return true; // 이벤트 처리 완료(=pop 막음)
      }
      return false; // summary에서는 기본 동작(=pop 허용)
    });

    return () => sub.remove();
  }, [goBackLike, step]);

  const onPressPayStart = () => setStep('form');

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

    setPin('');
    setStep('pin');
  };

  const onPressNotify = () => {
    Alert.alert('알림', 'TODO: 송금 완료 알림 보내기');
    setPin('');
    setStep('summary');
  };

  const appendPin = (digit: string) => {
    if (pin.length >= PIN_LEN) return;
    setPin(prev => prev + digit);
  };

  const backspacePin = () => setPin(prev => prev.slice(0, -1));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScreenLayout>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>납부 {groupName ? `- ${groupName}` : ''}</Text>

          {/* ✅ 헤더 뒤로/닫기도 동일 로직 */}
          <Pressable onPress={goBackLike} hitSlop={12}>
            <Text style={styles.closeText}>{step === 'summary' ? '닫기' : '뒤로'}</Text>
          </Pressable>
        </View>

        {step === 'summary' && (
          <View style={{ marginTop: 16 }}>
            <View style={styles.bigCard}>
              <Text style={styles.bigCardText}>
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
            <View style={styles.formBox}>
              <Text style={styles.formLabel}>금액</Text>
              <TextInput
                value={amountText}
                onChangeText={setAmountText}
                keyboardType="number-pad"
                placeholder="금액 입력"
                style={styles.formInput}
              />
            </View>

            <Pressable
              onPress={() => setAccountIndex(i => (i + 1) % accounts.length)}
              style={styles.formBox}
            >
              <Text style={styles.formLabel}>계좌 선택</Text>
              <Text style={styles.formValue}>{selectedAccount}</Text>
              <Text style={styles.formHint}>눌러서 계좌 변경(임시)</Text>
            </Pressable>

            <View style={styles.formBox}>
              <Text style={styles.formLabel}>메모</Text>
              <TextInput
                value={memo}
                onChangeText={setMemo}
                placeholder="메모"
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

            <View style={styles.pinDotsRow}>
              {Array.from({ length: PIN_LEN }).map((_, idx) => {
                const filled = idx < pin.length;
                return (
                  <View key={idx} style={[styles.pinDot, filled && styles.pinDotFilled]} />
                );
              })}
            </View>

            <View style={styles.keypad}>
              {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map(k => {
                const isBack = k === '⌫';
                const isDot = k === '.';

                return (
                  <Pressable
                    key={k}
                    onPress={() => {
                      if (isBack) backspacePin();
                      else if (isDot) return;
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
          </View>
        )}
      </ScreenLayout>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 20, fontWeight: '900' },
  closeText: { fontSize: 16, fontWeight: '700' },

  bigCard: { borderRadius: 24, backgroundColor: '#E5E7EB', padding: 18, minHeight: 120, justifyContent: 'center' },
  bigCardText: { fontSize: 16, fontWeight: '700', textAlign: 'center' },

  primaryBtn: { marginTop: 16, height: 56, borderRadius: 18, backgroundColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontSize: 16, fontWeight: '900' },

  formBox: { borderRadius: 22, backgroundColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 14 },
  formLabel: { fontSize: 14, fontWeight: '900', marginBottom: 10 },
  formInput: { height: 44, borderRadius: 12, backgroundColor: '#F3F4F6', paddingHorizontal: 12 },
  formValue: { fontSize: 15, fontWeight: '700' },
  formHint: { marginTop: 6, fontSize: 12 },

  pinTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginTop: 20 },
  pinDotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 26 },
  pinDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#D1D5DB' },
  pinDotFilled: { backgroundColor: '#6B7280' },

  keypad: { marginTop: 26, flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  keyBtn: { width: '30%', height: 54, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  keyText: { fontSize: 18, fontWeight: '800' },

  successTitle: { fontSize: 22, fontWeight: '900' },
});