import { View } from 'react-native';
import { useState } from 'react';
import QR from './components/QR';
import { Text } from 'react-native-gesture-handler';
import CardRecommendation from './components/CardRecommendation';

export default function index() {
  const [cardNumber, setCardNumber] = useState<number>(0);

  return (
    <View className="flex-1">
      <View className="flex-1 border border-solid border-black">
        <QR cardNumber={cardNumber} className="w-full h-full" />
      </View>
      <View className="flex-1">
        <Text className="text-xl font-bold bg-white rounded-full p-5">
          회식주의자
        </Text>
        <View className="flex-1 border border-solid border-black items-center">
          <CardRecommendation onSelectCard={setCardNumber} />
        </View>
      </View>
    </View>
  );
}
