import { View, Text, Pressable } from 'react-native';
import React, { useState } from 'react';

export default function ToggleButton() {
  const [type, setType] = useState<'barcode' | 'qr'>('barcode');
  return (
    <View className="flex-row w-full items-center border-2 border-gray-300 rounded-lg overflow-hidden">
      <Pressable
        className={`flex-1 py-2 ${
          type === 'barcode' ? 'bg-blue-500' : 'bg-white'
        }`}
        onPress={() => setType('barcode')}
      >
        <Text
          className={`text-center ${
            type === 'barcode' ? 'text-white' : 'text-black'
          }`}
        >
          바코드
        </Text>
      </Pressable>

      <Pressable
        className={`flex-1 py-2 ${type === 'qr' ? 'bg-blue-500' : 'bg-white'}`}
        onPress={() => setType('qr')}
      >
        <Text
          className={`text-center ${
            type === 'qr' ? 'text-white' : 'text-black'
          }`}
        >
          QR 스캔
        </Text>
      </Pressable>
    </View>
  );
}
