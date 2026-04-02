import React, { useState } from 'react';
import { View, Image, Pressable, ActivityIndicator } from 'react-native';
import Text from '@/components/typography';
import { images } from '../../types/images';
import { AuthScreenProps } from '../../types/navigation';
import { getDeviceToken } from '../../utils/tokenStorage';

export default function AuthLandingScreen({
  navigation,
}: AuthScreenProps<'AuthLanding'>) {
  const [checking, setChecking] = useState(false);

  const handleLoginPress = async () => {
    setChecking(true);
    try {
      const deviceToken = await getDeviceToken();
      if (deviceToken) {
        // 디바이스 토큰이 있으면 PIN 로그인으로 이동
        navigation.navigate('Login');
      } else {
        // 디바이스 토큰이 없으면 이메일/비밀번호 로그인으로 이동
        navigation.navigate('ReLogin');
      }
    } catch {
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
          className="w-[350px] h-[350px]"
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
            <Text weight="bold" color="white" className="text-2xl">
              LOGIN
            </Text>
          )}
        </Pressable>
      </View>

      <View className="items-center mb-10">
        <Text>ENCO에 처음 오셨나요?</Text>
        <Pressable onPress={() => navigation.navigate('SignupVerify')}>
          <Text color="blue">회원가입하러 가기</Text>
        </Pressable>
      </View>
    </View>
  );
}
