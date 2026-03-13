import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { AuthScreenProps } from '../../types/navigation';

export default function SignupCompleteScreen({
  navigation,
}: AuthScreenProps<'SignupComplete'>) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#F5F6F8',
        padding: 24,
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 30,
          fontFamily: 'GmarketSansTTFBold',
          marginBottom: 16,
          color: '#111827',
          textAlign: 'center',
        }}
      >
        가입 완료
      </Text>

      <Text
        style={{
          fontSize: 16,
          fontFamily: 'GmarketSansTTFMedium',
          color: '#6B7280',
          lineHeight: 24,
          textAlign: 'center',
          marginBottom: 40,
        }}
      >
        회원가입이 정상적으로 완료되었습니다.
      </Text>

      <Pressable
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'AuthLanding' }],
          })
        }
        style={{
          backgroundColor: '#1428A0',
          borderRadius: 16,
          height: 56,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 18,
            fontFamily: 'GmarketSansTTFBold',
          }}
        >
          로그인 하러 가기
        </Text>
      </Pressable>
    </View>
  );
}