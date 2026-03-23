// TODO: NetworkErrorView 테스트용 화면
// TODO: 실제 페이지 적용 완료 후 삭제 가능

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native'
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';;
import NetworkErrorView from '../../components/network/NetworkErrorView';

type ScreenStatus = 'offline' | 'retrying' | 'ready';

export default function NetworkErrorTestScreen() {
  const [status, setStatus] = useState<ScreenStatus>('offline');
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = async () => {
    if (status === 'retrying') return;

    setStatus('retrying');

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setRetryCount((prev) => prev + 1);
    setStatus('ready');
  };

  if (status === 'ready') {
    return (
      <View style={styles.pageContainer}>
        <Text style={styles.pageTitle}>원래 가려던 페이지</Text>
        <Text style={styles.pageDescription}>
          네트워크 연결이 복구되어 정상 화면으로 돌아왔어요.
        </Text>
        <Text style={styles.pageDescription}>재시도 횟수: {retryCount}</Text>

        <Pressable style={styles.testButton} onPress={() => setStatus('offline')}>
          <Text style={styles.testButtonText}>다시 에러 화면 보기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <NetworkErrorView
      title="인터넷 연결이 끊어졌어요"
      description="Wi-Fi 또는 모바일 데이터 연결을 확인한 뒤 다시 시도해주세요!"
      buttonText={status === 'retrying' ? '다시 시도 중...' : '다시 시도'}
      imageSource={require('../../assets/icons/error_hamco.png')}
      onRetry={handleRetry}
    />
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.brand,
    marginBottom: 12,
  },
  pageDescription: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.medium,
    color: COLORS.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  testButton: {
    marginTop: 20,
    backgroundColor: '#1428A0',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  testButtonText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.white,
  },
});