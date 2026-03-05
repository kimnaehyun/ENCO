import React from 'react';
import { View, Text, Image, Button, Pressable } from 'react-native';
import { images } from '../../assets/images';
import { RootStackScreenProps } from '../../types/auth';

export default function AuthLandingScreen({
  navigation,
}: RootStackScreenProps<'AuthLanding'>) {
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

      <Button title="로그인" onPress={() => {}} />
      <Text>회원이 아니신가요?</Text>
      <Pressable onPress={() => navigation.navigate('SignupForm')}>
        <Text style={{ textDecorationLine: 'underline' }}>
          {' '}
          회원가입하러 가기
        </Text>
      </Pressable>
    </View>
  );
}
