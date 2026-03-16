import { View, Text, Pressable, Image } from 'react-native';
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { images } from '../../types/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CardRecommendation from '../../components/onsite/Barcode/components/CardRecommendation';

export default function CardChoiceScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { title: string };
  const insets = useSafeAreaInsets();
  const [cardNumber, setCardNumber] = useState<number>(0);
  return (
    <View className="flex-1" style={{ marginTop: insets.top }}>
      <View className="flex-row items-center gap-4 m-4 bg-white rounded-[20px] p-4">
        <Pressable onPress={() => navigation.goBack()}>
          <Image source={images.left_arrow} />
        </Pressable>
        <Text className="font-bold text-xl">{params.title}</Text>
      </View>
      <View className="bg-white flex-1 mx-4 rounded-[20px] mb-4 p-4">
        <View>
          <Text className="text-xl">결제 카드 선택</Text>
        </View>
        <View className="flex-1 border border-solid border-black">
          <CardRecommendation onSelectCard={setCardNumber} />
        </View>
        <View></View>
      </View>
    </View>
  );
}
