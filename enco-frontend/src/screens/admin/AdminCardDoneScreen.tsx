// src/screens/admin/AdminCardDoneScreen.tsx
// 카드 추가 발급 > 신청 완료 화면 — API 응답 데이터 표시
import React from 'react';
import { Image, Pressable, View } from 'react-native';
import Text from '@/components/typography';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { images } from '../../types/images';
import { GroupStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from 'node_modules/@react-navigation/native-stack/lib/typescript/src/types';

type AdminCardDoneRouteProp = RouteProp<GroupStackParamList, 'AdminCardDone'>;
type AdminCardDoneNavigationProp = NativeStackNavigationProp<
  GroupStackParamList,
  'AdminCardDone'
>;

export default function AdminCardDoneScreen() {
  const navigation = useNavigation<AdminCardDoneNavigationProp>();
  const route = useRoute<AdminCardDoneRouteProp>();

  const { groupName, cardNumber, frontImageUrl } = route.params ?? {};

  const goHome = () => {
    navigation.popToTop();
  };

  return (
    <View className="flex-1 bg-white justify-center items-center px-8">
      {/* 발급된 카드 이미지 */}
      {frontImageUrl ? (
        <Image
          source={{ uri: frontImageUrl }}
          className="w-[280px] h-[170px] rounded-2xl mb-6"
          resizeMode="contain"
        />
      ) : (
        <Image
          source={images.cardDone}
          className="w-[220px] h-[220px] mb-6"
          resizeMode="contain"
        />
      )}

      {/* 완료 텍스트 */}
      <Text weight="bold" color="dark" align="center" className="mb-3 text-2xl">
        카드 발급 완료!
      </Text>

      {/* 카드 번호 표시 */}
      {cardNumber && (
        <Text variant="bodyMd" color="muted" align="center" className="mb-2">
          카드번호: {cardNumber}
        </Text>
      )}

      {groupName && (
        <Text
          variant="bodySm"
          color="placeholder"
          align="center"
          className="mb-10"
        >
          {groupName}
        </Text>
      )}

      {/* 홈으로 버튼 */}
      <Pressable
        onPress={goHome}
        className="py-4 px-10 rounded-[30px] bg-[#1428A0]"
      >
        <Text weight="bold" color="white">
          홈으로
        </Text>
      </Pressable>
    </View>
  );
}
