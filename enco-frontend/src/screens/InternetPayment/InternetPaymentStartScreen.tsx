import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { Image } from 'react-native';
import { images } from '../../types/images';
import { useNavigation } from '@react-navigation/native';

export default function InternetPaymentStartScreen() {
  const navigation = useNavigation<any>();
  return (
    <View className="flex-1 pt-48 px-4">
      <View className="flex gap-2 items-center">
        <View className="w-80 h-80">
          <Image
            className="w-full h-full"
            source={images.internetPaymentHamco}
          />
        </View>
        <Pressable
          className="w-80 bg-[#1428A0] py-4 rounded-[18px] flex items-center"
          onPress={() => {
            navigation.navigate('SelectGroupScreen');
          }}
        >
          <Text className="text-white font-bold text-base">결제하기</Text>
        </Pressable>
      </View>
    </View>
  );
}
