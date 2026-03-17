// src/screens/group/GroupLedgerDetailScreen.tsx
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { NativeModules } from 'react-native';
import ScreenLayout from '../../components/ScreenLayout';
import { LedgerItem } from '../../types/group';

const { OcrModule } = NativeModules;

type RouteParams = {
  item: LedgerItem;
  balance: number;
  isAdmin: boolean;
  groupName: string;
};

function formatMoney(n: number) {
  const sign = n >= 0 ? '+' : '-';
  return `${sign}${Math.abs(n).toLocaleString()}원`;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
      <Text style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'GmarketSansTTFMedium' }}>{label}</Text>
      <View style={{ flex: 1, alignItems: 'flex-end' }}>{children}</View>
    </View>
  );
}

export default function GroupLedgerDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { item, balance, isAdmin, groupName } = (route.params ?? {}) as RouteParams;

  const isPositive = item.amount >= 0;

  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [ocrLoading, setOcrLoading] = useState(false);

  // OCR 실행
  const runOcr = async (uri: string) => {
    if (!OcrModule) return;
    try {
      setOcrLoading(true);
      const text = await OcrModule.recognizeTextFromUri(uri);
      setOcrText(text || '');
    } catch (e: any) {
      Alert.alert('OCR 실패', e?.message ?? '알 수 없는 오류');
    } finally {
      setOcrLoading(false);
    }
  };

  // 카메라 촬영
  const handleCamera = async () => {
    navigation.navigate('OcrTest');
  };

  // 갤러리 첨부
  const handleGallery = async () => {
    navigation.navigate('OcrTest');
  };

  // 영수증 삭제
  const handleDeleteReceipt = () => {
    Alert.alert('삭제', '영수증을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => { setReceiptUri(null); setOcrText(''); } },
    ]);
  };

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* 헤더 */}
        <View className="flex-row items-center justify-between mb-5">
          <Text style={{ fontSize: 20, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}>
            모임 장부
          </Text>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>닫기</Text>
          </Pressable>
        </View>

        {/* 금액 + 잔액 */}
        <View
          className="bg-white rounded-3xl px-6 py-5 mb-4"
          style={{ shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 }}
        >
          <Text style={{
            fontSize: 32,
            fontFamily: 'GmarketSansTTFBold',
            color: isPositive ? '#1428A0' : '#EF4444',
            textAlign: 'right',
            marginBottom: 4,
          }}>
            {formatMoney(item.amount)}
          </Text>
          <Text style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'GmarketSansTTFMedium', textAlign: 'right', marginBottom: 16 }}>
            잔액 {balance.toLocaleString()}원
          </Text>

          <View className="h-px bg-gray-100 mb-1" />

          <InfoRow label="사용카드">
            <Text style={{ fontSize: 14, color: '#111827', fontFamily: 'GmarketSansTTFMedium' }}>
              회식주의자카드
            </Text>
          </InfoRow>
          <InfoRow label="잔액">
            <Text style={{ fontSize: 14, color: '#111827', fontFamily: 'GmarketSansTTFMedium' }}>
              {balance.toLocaleString()}원
            </Text>
          </InfoRow>
          <InfoRow label="거래구분">
            {/* 조사 필요 상태는 빨간 텍스트 */}
            <Text style={{ fontSize: 14, color: item.hasReceipt ? '#111827' : '#EF4444', fontFamily: 'GmarketSansTTFBold' }}>
              {item.hasReceipt ? (isPositive ? '입금' : '출금') : '조사 필요'}
            </Text>
          </InfoRow>
          <InfoRow label="메모">
            <Text style={{ fontSize: 14, color: item.memo ? '#111827' : '#D1D5DB', fontFamily: 'GmarketSansTTFMedium' }}>
              {item.memo || '내용을 입력하세요'}
            </Text>
          </InfoRow>

          {/* 영수증 행 */}
          <View className="flex-row items-start justify-between pt-3">
            <Text style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'GmarketSansTTFMedium' }}>영수증</Text>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              {receiptUri ? (
                /* 영수증 이미지 미리보기 */
                <View>
                  <Image
                    source={{ uri: receiptUri }}
                    style={{ width: 200, height: 260, borderRadius: 12, marginBottom: 8 }}
                    resizeMode="cover"
                  />
                  {ocrLoading && (
                    <Text style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'GmarketSansTTFMedium', textAlign: 'center' }}>
                      OCR 분석 중...
                    </Text>
                  )}
                  {ocrText !== '' && (
                    <View style={{ backgroundColor: '#F9FAFB', borderRadius: 10, padding: 10, marginBottom: 8, maxWidth: 200 }}>
                      <Text style={{ fontSize: 11, color: '#374151', fontFamily: 'GmarketSansTTFMedium', lineHeight: 18 }}>
                        {ocrText}
                      </Text>
                    </View>
                  )}
                  {isAdmin && (
                    <Pressable onPress={handleDeleteReceipt}>
                      <Text style={{ fontSize: 12, color: '#EF4444', fontFamily: 'GmarketSansTTFMedium', textAlign: 'right' }}>
                        삭제
                      </Text>
                    </Pressable>
                  )}
                </View>
              ) : (
                <Text style={{ fontSize: 13, color: '#D1D5DB', fontFamily: 'GmarketSansTTFMedium' }}>
                  {isAdmin ? '영수증을 등록하세요' : '등록된 영수증 없습니다'}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* 관리자 전용 — 영수증 촬영/첨부 버튼 */}
        {isAdmin && (
          <View className="flex-row gap-3">
            <Pressable
              onPress={handleCamera}
              className="flex-1 items-center justify-center rounded-2xl py-5 bg-white gap-2"
              style={{ shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 }}
            >
              {/* 카메라 아이콘 (텍스트 대체) */}
              <Text style={{ fontSize: 28 }}>📷</Text>
              <Text style={{ fontSize: 14, color: '#374151', fontFamily: 'GmarketSansTTFBold' }}>영수증 촬영하기</Text>
            </Pressable>

            <Pressable
              onPress={handleGallery}
              className="flex-1 items-center justify-center rounded-2xl py-5 bg-white gap-2"
              style={{ shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 }}
            >
              <Text style={{ fontSize: 28 }}>🖼️</Text>
              <Text style={{ fontSize: 14, color: '#374151', fontFamily: 'GmarketSansTTFBold' }}>사진 첨부하기</Text>
            </Pressable>
          </View>
        )}

      </ScrollView>
    </ScreenLayout>
  );
}