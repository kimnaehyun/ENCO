// src/screens/admin/AdminCardDoneScreen.tsx
// 카드 추가 발급 > 신청 완료 화면
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { images } from '../../types/images';

export default function AdminCardDoneScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { groupId, groupName, selectedCardId } = route.params ?? {};

  const goHome = () => {
    // AdminCard 발급 흐름(AdminCard → AdminCardRecommend → AdminCardPin → AdminCardDone)을
    // 모두 pop하고 대시보드로 돌아감. 뒤로가기 시 완료 페이지로 돌아오지 않음.
    navigation.popToTop();
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
      }}
    >
      {/* 캐릭터 이미지 */}
      <Image
        source={images.cardDone}
        style={{
          width: 220,
          height: 220,
          marginBottom: 32,
        }}
        resizeMode="contain"
      />

      {/* 완료 텍스트 */}
      <Text
        style={{
          fontSize: 24,
          color: '#111827',
          fontFamily: 'GmarketSansTTFBold',
          textAlign: 'center',
          marginBottom: 40,
        }}
      >
        신청 완료되었습니다!
      </Text>

      {/* 홈으로 버튼 */}
      <Pressable
        onPress={goHome}
        style={{
          paddingHorizontal: 40,
          paddingVertical: 16,
          borderRadius: 30,
          backgroundColor: '#1428A0',
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: '#FFFFFF',
            fontFamily: 'GmarketSansTTFBold',
          }}
        >
          홈으로
        </Text>
      </Pressable>
    </View>
  );
}