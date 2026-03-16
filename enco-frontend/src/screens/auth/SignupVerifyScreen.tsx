import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { AuthScreenProps } from '../../types/navigation';
import { images } from '../../types/images';

export default function SignupVerifyScreen({
  navigation,
}: AuthScreenProps<'SignupVerify'>) {
  return (
    <View className="flex-1 bg-[#F0F4FF] p-6 justify-center items-center">
      <Image
        source={images.phone}
        className="w-[350px] h-[350px]"
        resizeMode="contain"
      />
      <Pressable
        onPress={() => navigation.navigate('InputInfo')}
        className="bg-[#1428A0] rounded-2xl h-14 px-12 items-center justify-center"
      >
        <Text
          className="text-white text-2xl"
          style={{ fontFamily: 'GmarketSansTTFBold', fontSize : 32 }}
        >
          본인 인증하기
        </Text>
      </Pressable>
    </View>
  );
}