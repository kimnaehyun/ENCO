import { Text, Pressable } from 'react-native';
import React from 'react';

export default function PayButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      className="w-80 bg-[#1428A0] py-4 rounded-[18px] flex items-center"
      onPress={onPress}
    >
      <Text className="text-white font-bold text-base">결제하기</Text>
    </Pressable>
  );
}
