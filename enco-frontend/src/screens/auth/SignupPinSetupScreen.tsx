import React, { useState } from 'react';
import { View, Alert, ActivityIndicator } from 'react-native';
import Text from '@/components/typography';
import type { AuthScreenProps } from '../../types/navigation';
import PinEntry from '../../components/pin/PinEntry';
import { signupService } from '../../services/authService';
import { saveDeviceToken } from '../../utils/tokenStorage';

export default function SignupPinSetupScreen({
  route,
  navigation,
}: AuthScreenProps<'SignupPinSetup'>) {
  const { name, birth, phone, email, gender, profileUrl } = route.params;

  const [step, setStep] = useState<'set' | 'confirm'>('set');
  const [firstPin, setFirstPin] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const resetPinEntry = () => setResetKey(k => k + 1);

  // 생년월일 포맷: 20000101 → 2000-01-01
  const formatBirthDay = (raw: string): string => {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  };

  const handleSignup = async (pinCode: string) => {
    setLoading(true);
    try {
      const response = await signupService({
        name,
        email,
        password: pinCode,
        birthDay: formatBirthDay(birth),
        phoneNumber: phone,
        gender,
        pinCode,
        profileUrl,
      });

      // deviceToken 저장 (로그인 시 사용)
      if (response.result?.deviceToken) {
        await saveDeviceToken(response.result.deviceToken);
      }

      navigation.replace('SignupComplete', { userName: name });
    } catch (err: unknown) {
      console.log('====== 회원가입 실패 ======');
      console.log(
        'Status:',
        (err as { response?: { status?: number } })?.response?.status,
      );
      console.log(
        'Response Data:',
        JSON.stringify(
          (err as { response?: { data?: unknown } })?.response?.data,
          null,
          2,
        ),
      );
      console.log(
        'Request Data:',
        JSON.stringify(
          (err as { config?: { data?: unknown } })?.config?.data,
          null,
          2,
        ),
      );
      console.log('Error Message:', (err as { message?: string }).message);
      console.log('===========================');

      // PIN 입력 초기화
      setFirstPin(null);
      setStep('set');
      resetPinEntry();
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (pin: string) => {
    if (step === 'set') {
      setFirstPin(pin);
      setError('');
      setStep('confirm');
      resetPinEntry();
      return;
    }

    // confirm 단계
    if (pin !== firstPin) {
      setError('비밀번호가 일치하지 않아요');
      setFirstPin(null);
      setStep('set');
      resetPinEntry();
      return;
    }

    // PIN 일치 → API 호출
    handleSignup(pin);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#F0F4FF] items-center justify-center">
        <ActivityIndicator size="large" color="#1428A0" />
        <Text className="text-[#374151] text-lg mt-4">회원가입 중...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F0F4FF] p-6">
      {error ? (
        <Text className="text-red-500 text-center mb-4">{error}</Text>
      ) : null}

      <PinEntry
        key={`${step}-${resetKey}`}
        title={
          step === 'set'
            ? '간편 비밀번호를\n입력해주세요'
            : '한번 더\n입력해주세요'
        }
        resetKey={resetKey}
        onComplete={handleComplete}
      />
    </View>
  );
}
