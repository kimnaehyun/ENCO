import { View, Text, Pressable, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { images } from '../../types/images';
import KeyValueRow from '../../components/common/KeyValueRow';
import PointToggleButton from '../../components/payment/PointToggleButton';
import PayButton from '../../components/internet/PayButton';
import ScreenLayout from '../../components/ScreenLayout';
import BarcodeCardRecommendation from '@/components/onsite/Barcode/BarcodeCardRecommendation';
import { getGroupCards } from '@/services/paymentService';
import { getPoint } from '@/services/authService';
import { RootStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type CardChoiceNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CardChoiceScreen'
>;
type CardChoiceRouteProp = RouteProp<RootStackParamList, 'CardChoiceScreen'>;

export default function CardChoiceScreen() {
  const navigation = useNavigation<CardChoiceNavigationProp>();
  const route = useRoute<CardChoiceRouteProp>();
  const params = route.params;
  const [cardNumber, setCardNumber] = useState<number>(0);

  const [cardsInfo, setCardsInfo] = useState<
    {
      image: string;
      cardId: number;
    }[]
  >([]);

  const [point, setPoint] = useState<boolean>(true);
  const [pointUsage, setPointUsage] = useState<boolean>(true);

  useEffect(() => {
    const fetchCards = async () => {
      const response = await getGroupCards(params.groupId);
      const mapped = response.result.map(item => ({
        image: item.frontCardImageUrl,
        cardId: item.cardId,
      }));
      setCardsInfo(mapped);
      if (mapped.length > 0) {
        setCardNumber(mapped[0].cardId);
      }
    };
    fetchCards();

    const fetchPoint = async () => {
      const response = await getPoint(params.groupId);
      setPoint(response.result);
    };
    fetchPoint();
  }, []);

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
            <BarcodeCardRecommendation
              onSelectCard={setCardNumber}
              cardsInfo={cardsInfo}
            />
          </View>
          <View className="flex-1 gap-5">
            <KeyValueRow title="금액">
              <Text className="font-bold text-[20px]">{params.amount}원</Text>
            </KeyValueRow>
            <View className="flex-row justify-between items-center ">
              <View className="flex-row items-center">
                <Text className="text-[20px]">보유 포인트</Text>
                <Text className="text-[#1428A0] text-[20px]">{point}P</Text>
              </View>
              <PointToggleButton
                pointUsage={pointUsage}
                pointUsageFn={(usage: boolean) => setPointUsage(usage)}
              />
            </View>
            <KeyValueRow title="가맹점명">
              <Text className="font-bold text-[20px]">{params.storeName}</Text>
            </KeyValueRow>
          </View>
          <View className="flex items-center">
            <PayButton
              onPress={() =>
                navigation.navigate('VoteCreateScreen', {
                  groupId: params.groupId,
                  cardId: cardNumber,
                  amount: params.amount ?? 0,
                  storeName: params.storeName ?? '',
                })
              }
            />
          </View>
        </View>
      </View>
    </ScreenLayout>
  );
}
