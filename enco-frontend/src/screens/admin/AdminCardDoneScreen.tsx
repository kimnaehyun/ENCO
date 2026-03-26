// src/screens/admin/AdminCardDoneScreen.tsx
// 카드 추가 발급 > 신청 완료 화면 — API 응답 데이터 표시
import React from 'react';
import { Image, Pressable, View } from 'react-native';
import Text from '@/components/typography';
import { useNavigation, useRoute } from '@react-navigation/native';
import { images } from '../../types/images';

export default function AdminCardDoneScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const {
    groupId,
    groupName,
    cardId,
    cardNumber,
    frontImageUrl,
  } = route.params ?? {};

  const goHome = () => {
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
      {/* 발급된 카드 이미지 */}
      {frontImageUrl ? (
        <Image
          source={{ uri: frontImageUrl }}
          style={{
            width: 280,
            height: 170,
            borderRadius: 16,
            marginBottom: 24,
          }}
          resizeMode="contain"
        />
      ) : (
        <Image
          source={images.cardDone}
          style={{
            width: 220,
            height: 220,
            marginBottom: 24,
          }}
          resizeMode="contain"
        />
      )}

      {/* 완료 텍스트 */}
      <Text weight="bold" color="dark" align="center" style={{ marginBottom: 12, fontSize: 24 }}>
        카드 발급 완료!
      </Text>

      {/* 카드 번호 표시 */}
      {cardNumber && (
        <Text variant="bodyMd" color="muted" align="center" style={{ marginBottom: 8 }}>
          카드번호: {cardNumber}
        </Text>
      )}

      {groupName && (
        <Text variant="bodySm" color="placeholder" align="center" style={{ marginBottom: 40 }}>
          {groupName}
        </Text>
      )}

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
        <Text weight="bold" color="white">
          홈으로
        </Text>
      </Pressable>
    </View>
  );
}
