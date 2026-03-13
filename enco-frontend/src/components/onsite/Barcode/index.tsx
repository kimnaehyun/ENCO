import { View } from 'react-native';
import { useState } from 'react';
import QR from './components/QR';
import { Text } from 'react-native-gesture-handler';
import CardRecommendation from './components/CardRecommendation';

export default function index() {
  const [cardNumber, setCardNumber] = useState<number>(0);

  return (
    <View className="flex-1">
      <View className="flex-row w-full py-4 justify-around items-center">
        <QR cardNumber={cardNumber} className="w-24 h-24" />
      </View>

      <View className="flex-1">
        <Text className="text-2xl font-bold text-center py-10">
          결제 추천 카드
        </Text>
        <View className="flex-1 pt-10">
          <CardRecommendation onSelectCard={setCardNumber} />
        </View>
      </View>
    </View>
  );
}
