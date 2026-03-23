import React, { useState } from 'react';
import { View, Image, Pressable, ActivityIndicator } from 'react-native'
import Text from '@/components/typography';;
import { images } from '../../types/images';
import { AuthScreenProps } from '../../types/navigation';
import { getDeviceToken, saveDeviceToken } from '../../utils/tokenStorage';

export default function AuthLandingScreen({
  navigation,
}: AuthScreenProps<'AuthLanding'>) {
  const [checking, setChecking] = useState(false);

  const handleLoginPress = async () => {
    setChecking(true);
    try {
      let deviceToken = await getDeviceToken();

      // 테스트용: 저장된 deviceToken이 없으면
      // 백엔드가 준 실제 테스트 계정 deviceToken 저장
      if (!deviceToken) {
        await saveDeviceToken('14e09e18-35f6-4dfa-bed6-54fc5f122944');
        deviceToken = await getDeviceToken();
      }

      if (deviceToken) {
        // 디바이스 토큰이 있으면 PIN 로그인으로 이동
        navigation.navigate('Login');
      } else {
        // 디바이스 토큰이 없으면 이메일/비밀번호 로그인으로 이동
        navigation.navigate('ReLogin');
      }
    } catch (error) {
      console.error('로그인 분기 확인 실패:', error);
      // 에러 시 안전하게 ReLogin으로 이동
      navigation.navigate('ReLogin');
    } finally {
      setChecking(false);
    }
  };

  return (
    <View className="flex-1 px-6 bg-[#F0F4FF]">
      <View className="flex-1 justify-center items-center">
        <Image
          source={images.logo}
          style={{ width: 350, height: 350 }}
          resizeMode="contain"
        />
        <Pressable
          className="bg-[#1428A0] rounded-2xl px-12 py-3 items-center"
          onPress={handleLoginPress}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text weight="bold" color='white'
              
             style={{ fontSize: 24 }}>
              LOGIN
            </Text>
          )}
        </Pressable>
      </View>

      <View className="items-center mb-10">
        <Text
          
        >
          ENCO에 처음 오셨나요?
        </Text>
        <Pressable onPress={() => navigation.navigate('SignupVerify')}>
          <Text color='blue'
            
          >
            회원가입하러 가기
          </Text>
        </Pressable>
      </View>
    </View>
  );
}