import { View } from 'react-native';
import React from 'react';
import Barcode from './components/Barcode';
import QR from './components/QR';
import { Text } from 'react-native-gesture-handler';

export default function index() {
  return (
    <View>
      <View className="flex-row w-full">
        <View className="flex-1">
          <Barcode />
        </View>
        <View className="flex-1">
          <QR />
        </View>
      </View>
      <View>
        <Text className="text-lg font-bold border-2 border-black text-center">
          결제 카드 추천
        </Text>
      </View>
    </View>
  );
}
