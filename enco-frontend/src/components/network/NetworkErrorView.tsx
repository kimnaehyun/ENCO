// TODO: API 연동 후 각 페이지의 조회 실패 시 공통 네트워크 에러 UI로 사용
// TODO: onRetry에 페이지별 재조회 함수 연결
// TODO: retryDisabled로 재시도 중 중복 클릭 방지

import React from 'react';
import { View, Pressable, StyleSheet, Image, ImageSourcePropType } from 'react-native'
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';;

type NetworkErrorViewProps = {
  title?: string;
  description?: string;
  buttonText?: string;
  onRetry?: () => void;
  imageSource?: ImageSourcePropType;
  retryDisabled?: boolean;
};

export default function NetworkErrorView({
  title = '인터넷 연결이 끊어졌어요',
  description = 'Wi-Fi 또는 모바일 데이터 연결을 확인한 뒤\n다시 시도해주세요!',
  buttonText = '다시 시도',
  onRetry,
  imageSource,
 retryDisabled = false,
}: NetworkErrorViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageWrapper}>
          {imageSource ? (
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <Pressable
          onPress={onRetry}
          android_ripple={{ color: COLORS.brand }}
          style={[
            styles.retryButton,
            retryDisabled && styles.retryButtonDisabled,
          ]}
          disabled={retryDisabled}
        >
          <Text style={styles.retryButtonText}>{buttonText}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECECEC',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 72,
  },
  imageWrapper: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.brand,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONT_FAMILY.medium,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: 22,
  },
  retryButton: {
    backgroundColor: '#1428A0',
    minWidth: 240,
    height: 56,
    paddingHorizontal: 32,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonPressed: {
    opacity: 0.85,
  },
  retryButtonText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 24,
    color: COLORS.white,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  retryButtonDisabled: {
  opacity: 0.6,
},
});