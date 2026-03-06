// src/screens/auth/AuthLandingScreen.tsx
import React from 'react';
import { View, Text, Image, Button, Pressable } from 'react-native';
import { images } from '../../assets/images';
import { AuthStackScreenProps } from '../../types/auth';

export default function AuthLandingScreen({
  navigation,
}: AuthStackScreenProps<'AuthLanding'>) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
      }}
    >
      <Image
        source={images.logo}
        style={{ width: 120, height: 120 }}
        resizeMode="contain"
      />

      {/* 로그인 */}
      <Button
        title="로그인"
        onPress={() => navigation.navigate('Login')}
      />

      <Text>회원이 아니신가요?</Text>

      {/* 회원가입 */}
      <Pressable onPress={() => navigation.navigate('SignupForm')}>
        <Text style={{ textDecorationLine: 'underline' }}>
          회원가입하러 가기
        </Text>
      </Pressable>
    </View>
  );
}