import React from 'react';
import { View, Text, Image, Button, Pressable } from 'react-native';
import { images } from '../../types/images';
import { AuthScreenProps } from '../../types/navigation'; 

export default function AuthLandingScreen({
  navigation,
}: AuthScreenProps<'AuthLanding'>) {
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

      <Button title="로그인" onPress={() => navigation.navigate('Login')} />

      <Text>회원이 아니신가요?</Text>

      <Pressable onPress={() => navigation.navigate('SignupForm')}>
        <Text style={{ textDecorationLine: 'underline' }}>
          회원가입하러 가기
        </Text>
      </Pressable>
    </View>
  );
}