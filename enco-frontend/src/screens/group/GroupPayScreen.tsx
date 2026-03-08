// src/screens/group/GroupPayScreen.tsx
import ScreenLayout from '../../components/ScreenLayout';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  Text,
  View,
} from 'react-native';
import { GroupPayStep, GroupProps } from '../../types/group';

const PIN_LEN = 6;

const formatKRW = (n: number) => `₩ ${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

export default function GroupPayScreen({ navigation, route }: GroupProps<'GroupPay'>) {
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

  // ====== 화면 상태 =====
  const [step, setStep] = useState<GroupPayStep>('summary');

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
    <ScreenLayout>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 20, fontWeight: '900' }}>
          납부 {params.groupName ? `- ${params.groupName}` : ''}
        </Text>

        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={{ fontSize: 16, fontWeight: '700' }}>닫기</Text>
        </Pressable>
      </View>

      <View
        style={{
          marginTop: 16,
          borderRadius: 24,
          backgroundColor: '#E5E7EB',
          padding: 16,
          gap: 10,
        }}
      >
        <Text style={{ fontWeight: '800' }}>임시 납부 페이지</Text>
        <Text>- 이번 달 회비: ₩10,000 (임시)</Text>
        <Text>- 납부 마감: 2026-03-31 (임시)</Text>
        <Text>- 버튼/결제 연동은 나중에</Text>
      </View>
    </ScreenLayout>
  );
}