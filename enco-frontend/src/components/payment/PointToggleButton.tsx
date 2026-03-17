import { Pressable, Text, View } from 'react-native';
import React, { useState } from 'react';

export default function PointToggleButton() {
  const [point, setPoint] = useState<boolean>(true);
  return (
    <View className="w-32 bg-white border border-[#636363] rounded-[20px] overflow-hidden relative flex-row">
      <View
        className={`absolute top-0 bottom-0 w-1/2 rounded-[20px] ${
          point ? 'left-0 bg-[#1428A0] ' : 'left-1/2 bg-[#D9D9D9]'
        }`}
      />

      <Pressable
        className="flex-1 py-2"
        onPress={() => {
          setPoint(true);
        }}
      >
        <Text
          className={`text-center font-bold text-xl ${point && 'text-white'}`}
        >
          {point ? 'ON' : 'OFF'}
        </Text>
      </Pressable>

      <Pressable
        className="flex-1 py-2"
        onPress={() => {
          setPoint(false);
        }}
      >
        <Text className="text-center text-lg">Point</Text>
      </Pressable>
    </View>
  );
}
