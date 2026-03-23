import React, { useState } from 'react';
import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native';
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
            <Text
              style={{
                fontFamily: 'GmarketSansTTFBold',
                color: 'white',
                fontSize: 24,
              }}
            >
              LOGIN
            </Text>
          )}
        </Pressable>
      </View>

      <View className="items-center mb-10">
        <Text
          style={{ fontFamily: 'GmarketSansTTFMedium', fontSize: 16 }}
        >
          ENCO에 처음 오셨나요?
        </Text>
        <Pressable onPress={() => navigation.navigate('SignupVerify')}>
          <Text
            style={{
              textDecorationLine: 'underline',
              color: 'blue',
              fontFamily: 'GmarketSansTTFMedium',
              fontSize: 16,
            }}
          >
            회원가입하러 가기
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
