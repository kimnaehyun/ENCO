import React, { useState } from 'react';
import { View, Alert, ActivityIndicator } from 'react-native';
import Text from '@/components/typography';
import type { AuthScreenProps } from '../../types/navigation';
import PinEntry from '../../components/pin/PinEntry';
import { useAuthStore } from '../../store/useAuthStore';
import { loginService } from '../../services/authService';
import { getDeviceToken, saveTokens } from '../../utils/tokenStorage';

export default function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const [resetKey, setResetKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const loginWithProfile = useAuthStore(s => s.loginWithProfile);

  const handlePinComplete = async (pin: string) => {
    setLoading(true);
    try {
      const deviceToken = await getDeviceToken();

      if (!deviceToken) {
        // 혹시 여기까지 왔는데 디바이스 토큰이 없으면 ReLogin으로 이동
        navigation.replace('ReLogin');
        return;
      }

      const response = await loginService({
        pinCode: pin,
        deviceToken,
      });

      // accessToken 저장
      if (response.result?.accessToken) {
        console.log('[Login] accessToken:', response.result.accessToken);
        await saveTokens(response.result.accessToken, '');
      }

      // 로그인 + 프로필을 한 번에 저장 (타이밍 이슈 방지)
      const r = response.result;
      console.log('[Login] profileImg:', r.profileImg);
      loginWithProfile(
        r.name,
        {
          name: r.name,
          email: r.email ?? '',
          phoneNumber: r.phoneNumber ?? '',
          birthDay: '',
          gender: 'M',
          address: '',
          profileUrl: r.profileImg ?? 0,
        },
        r.id,
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        '로그인에 실패했습니다. 다시 시도해주세요.';
      Alert.alert('로그인 실패', message);
      setResetKey(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#F0F4FF] items-center justify-center">
        <ActivityIndicator size="large" color="#1428A0" />
        <Text className="text-[#374151] text-lg mt-4">로그인 중...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <PinEntry
        title={'비밀번호를\n입력해주세요'}
        resetKey={resetKey}
        length={4}
        onComplete={handlePinComplete}
      />
    </View>
  );
}
