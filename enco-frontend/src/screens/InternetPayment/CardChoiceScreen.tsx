import { View, Text, Pressable, Image } from 'react-native';
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { images } from '../../types/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CardRecommendation from '../../components/onsite/Barcode/components/CardRecommendation';
import KeyValueRow from '../../components/common/KeyValueRow';
import PointToggleButton from '../../components/payment/PointToggleButton';
import PayButton from '../../components/internet/PayButton';
import ScreenLayout from '../../components/ScreenLayout';

export default function CardChoiceScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as { title: string };
  const insets = useSafeAreaInsets();
  const [cardNumber, setCardNumber] = useState<number>(0);
  return (
    <ScreenLayout className="gap-4">
      <View className="flex-row items-center gap-4 bg-white rounded-[20px] p-4">
        <Pressable onPress={() => navigation.goBack()}>
          <Image source={images.left_arrow} />
        </Pressable>
        <Text className="font-bold text-xl">{params.title}</Text>
      </View>
      <View className="bg-white flex-1 rounded-[20px] mb-4 p-4">
        <View>
          <Text className="text-xl">결제 카드 선택</Text>
        </View>
        <View className="flex-1">
          <View className="h-96">
            <CardRecommendation onSelectCard={setCardNumber} />
          </View>
          <View className="flex-1 gap-5">
            <KeyValueRow title="금액">
              <Text className="font-bold text-[20px]">789,000</Text>
            </KeyValueRow>
            <View className="flex-row justify-between items-center ">
              <View className="flex-row items-center">
                <Text className="text-[20px]">보유 포인트</Text>
                <Text className="text-[#1428A0] text-[20px]">80P</Text>
              </View>
              <PointToggleButton />
            </View>
            <KeyValueRow title="가맹점명">
              <Text className="font-bold text-[20px]">여기 엇-혜역</Text>
            </KeyValueRow>
          </View>
          <View className="flex items-center">
            <PayButton
              onPress={() => navigation.navigate('PaymentPinScreen')}
            />
          </View>
        </View>
      </View>
    </ScreenLayout>
  );
}
