// src/screens/group/GroupLedgerDetailScreen.tsx
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { NativeModules } from 'react-native';
import ScreenLayout from '../../components/ScreenLayout';
import { LedgerItem, SettleMember } from '../../types/group';

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

  // 정산 멤버 데이터 — LedgerItem에서 가져옴
  const settleMembers: SettleMember[] = item.settleMembers ?? [];
  const paidCount = settleMembers.filter(m => m.isPaid).length;
  const totalCount = settleMembers.length;
  const unpaidCount = totalCount - paidCount;
  const isSettled = item.isSettled ?? (totalCount === 0 || paidCount === totalCount);

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

  // 미납자 알림 보내기 (빠른 동작)
  const handleQuickNotify = () => {
    const unpaidNames = settleMembers
      .filter(m => !m.isPaid)
      .map(m => m.name)
      .join(', ');

    if (unpaidCount === 0) return;

    const perPerson = totalCount > 0 ? Math.ceil(Math.abs(item.amount) / totalCount) : 0;

    Alert.alert(
      '미납자 알림 보내기',
      `${unpaidNames}에게 ${perPerson.toLocaleString()}원 입금 요청 알림을 보냅니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '보내기',
          onPress: () => {
            Alert.alert('완료', `미납자 ${unpaidCount}명에게 알림을 보냈습니다.`);
          },
        },
      ]
    );
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

          {/* 상태 — 정산완료 / 정산미완료 (정산 필요한 출금만 표시) */}
          {item.needsSettle && (
            <InfoRow label="상태">
              <View style={{
                backgroundColor: isSettled ? '#22C55E' : '#EF4444',
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}>
                <Text style={{ fontSize: 12, color: '#fff', fontFamily: 'GmarketSansTTFBold' }}>
                  {isSettled ? '정산완료' : `정산미완료 (${paidCount}/${totalCount}명)`}
                </Text>
              </View>
            </InfoRow>
          )}

          <InfoRow label="잔액">
            <Text style={{ fontSize: 14, color: '#111827', fontFamily: 'GmarketSansTTFMedium' }}>
              {balance.toLocaleString()}원
            </Text>
          </InfoRow>
          <InfoRow label="거래구분">
            <Text style={{
              fontSize: 14,
              fontFamily: 'GmarketSansTTFBold',
              color: isPositive ? '#1428A0' : (item.needsSettle ? '#F59E0B' : '#EF4444'),
            }}>
              {isPositive ? '입금' : (item.needsSettle ? '출금 (정산 필요)' : '출금')}
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

        {/* ── 처리 미완료 시: 미납자 요약 + 알림 바로 보내기 ── */}
        {!isSettled && totalCount > 0 && (
          <View
            className="bg-white rounded-3xl px-6 py-5 mt-4"
            style={{ shadowColor: '#EF4444', shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text style={{ fontSize: 15, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}>
                미납자 현황
              </Text>
              <View style={{
                backgroundColor: '#FEF2F2',
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}>
                <Text style={{ fontSize: 12, color: '#EF4444', fontFamily: 'GmarketSansTTFBold' }}>
                  {unpaidCount}명 미납
                </Text>
              </View>
            </View>

            {/* 미납자 목록 (간략) */}
            <View style={{ gap: 8, marginBottom: 12 }}>
              {settleMembers.filter(m => !m.isPaid).map(m => (
                <View key={m.id} className="flex-row items-center" style={{ gap: 10 }}>
                  <View style={{
                    width: 36, height: 36, borderRadius: 18,
                    backgroundColor: '#FEF2F2',
                    borderWidth: 1.5,
                    borderColor: '#EF4444',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 18 }}>🐹</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontFamily: 'GmarketSansTTFBold', color: '#111827', flex: 1 }}>
                    {m.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#EF4444', fontFamily: 'GmarketSansTTFBold' }}>
                    미납
                  </Text>
                </View>
              ))}
            </View>

            {/* 미납자 알림 보내기 (빠른 버튼) */}
            {isAdmin && (
              <Pressable
                onPress={handleQuickNotify}
                className="rounded-2xl py-3 items-center justify-center"
                style={{ backgroundColor: '#EF4444' }}
              >
                <Text style={{ fontSize: 14, color: '#fff', fontFamily: 'GmarketSansTTFBold' }}>
                  미납자에게 알림 보내기
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* 처리완료 시 완료 메시지 */}
        {isSettled && totalCount > 0 && (
          <View
            className="bg-white rounded-3xl px-6 py-5 mt-4 items-center"
            style={{ shadowColor: '#22C55E', shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 }}
          >
            <Text style={{ fontSize: 40, marginBottom: 8 }}>✅</Text>
            <Text style={{ fontSize: 16, fontFamily: 'GmarketSansTTFBold', color: '#22C55E' }}>
              정산이 완료되었습니다
            </Text>
            <Text style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'GmarketSansTTFMedium', marginTop: 4 }}>
              {totalCount}명 전원 납부 완료
            </Text>
          </View>
        )}

        {/* 정산인원 상세 보기 버튼 */}
        {totalCount > 0 && (
          <Pressable
            onPress={() => navigation.navigate('SettleMemberSelect', {
              amount: Math.abs(item.amount),
              storeName: item.title,
              date: item.date,
              memo: item.memo,
              receiptUri,
              groupName,
              settleMembers,
              isNewSettle: false,
            })}
            className="rounded-2xl py-4 items-center justify-center mt-3"
            style={{ backgroundColor: '#1428A0' }}
          >
            <Text style={{ fontSize: 16, color: '#fff', fontFamily: 'GmarketSansTTFBold' }}>
              정산인원 상세 보기
            </Text>
          </Pressable>
        )}

      </ScrollView>
    </ScreenLayout>
  );
}