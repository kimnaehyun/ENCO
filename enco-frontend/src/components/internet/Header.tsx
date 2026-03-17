import { View, Text } from 'react-native';
import React from 'react';

export default function Header({ title }: { title: string }) {
  return (
    <View className="bg-white py-4 pl-8 rounded-[20px]">
      <Text className="font-bold text-xl">{title}</Text>
    </View>
  );
}
