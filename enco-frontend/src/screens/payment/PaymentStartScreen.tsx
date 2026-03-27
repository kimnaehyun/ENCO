import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { images } from '../../types/images';
import PayButton from '../../components/internet/PayButton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 이미지: 화면 크기 기반 동적 계산 (작은 기종에서 overflow 방지)
const IMG_SIZE = Math.min(SCREEN_WIDTH * 0.6, SCREEN_HEIGHT * 0.32);

// 카드 최소 높이: 이미지 + 버튼 + 여백 기준
const CARD_MIN_HEIGHT = Math.min(IMG_SIZE + 120, SCREEN_HEIGHT * 0.75);

export default function PaymentStartScreen() {
  const navigation = useNavigation<any>();
  return (
    <ScreenLayout>
      <View style={styles.container}>
        <View style={styles.card}>
          <Image
            source={images.internetPaymentHamco}
            style={styles.image}
            resizeMode="contain"
          />
          <PayButton onPress={() => navigation.navigate('SelectGroupScreen')} />
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#F0F4FF',
    borderRadius: 26,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    minHeight: CARD_MIN_HEIGHT,
    justifyContent: 'center',
  },
  image: {
    width: IMG_SIZE,
    height: IMG_SIZE,
    marginBottom: 22,
  },
});
