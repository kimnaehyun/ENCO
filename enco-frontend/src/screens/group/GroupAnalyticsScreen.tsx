// GroupAnalyticsScreen.tsx

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';

export default function GroupAnalyticsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;

  const groupName = params.groupName ?? '모임명';

  return (
    <ScreenLayout>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>지출 분석</Text>

          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.closeText}>닫기</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.groupName}>{groupName}</Text>
          <Text style={styles.mainText}>지출내역 기반 시각화/분석 페이지</Text>
          <Text style={styles.subText}>
            다음 단계에서 카테고리별 통계, 월별 지출, 차트 등을 붙일 예정입니다.
          </Text>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FF',
  },
  headerRow: {
    marginTop: 6,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    color: '#111827',
    fontFamily: 'GmarketSansTTFBold',
  },
  closeText: {
    fontSize: 14,
    color: '#1428A0',
    fontFamily: 'GmarketSansTTFMedium',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  groupName: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFMedium',
    marginBottom: 10,
  },
  mainText: {
    fontSize: 18,
    color: '#111827',
    fontFamily: 'GmarketSansTTFBold',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFMedium',
  },
});