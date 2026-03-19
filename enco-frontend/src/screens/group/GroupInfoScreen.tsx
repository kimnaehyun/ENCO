// src/screens/group/GroupInfoScreen.tsx
import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';
import { images } from '../../types/images';
import { getGroupSettings } from '../../services/groupService';

const TAGS = ['여행', '음식', '스터디', '운동', '문화', '게임', '기타'];

// 발급 카드 목록 (실제로는 API에서 받아올 데이터)
const ISSUED_CARDS = [
  {
    id: 'card1',
    name: '스타벅스카드 삼성',
    image: images.card1,
  },
  {
    id: 'card2',
    name: '삼성카드 그린',
    image: images.card2,
  },
];

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="flex-row items-center py-4 border-b border-gray-100">
      <Text
        style={{
          width: 80,
          fontSize: 14,
          color: '#6B7280',
          fontFamily: 'GmarketSansTTFMedium',
        }}
      >
        {label}
      </Text>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

// 회비 상태 타입
type DuesState = {
  cycle: string;
  day: string;
  amount: string;
  rate: string;
};

export default function GroupInfoScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;

  const groupName = params.groupName ?? '모임명';
  const isAdmin = !!params.isAdmin;
  const groupId = 1;

  const [isEdit, setIsEdit] = useState(false);
  const [intro, setIntro] = useState('회식좋아하는사람들');
  const [selectedTags, setSelectedTags] = useState<string[]>(['여행', '음식']);
  const [dues, setDues] = useState<DuesState>({
    cycle: '매월',
    day: '15',
    amount: '10,000',
    rate: '80',
  });
  const [groundRules, setGroundRules] = useState(
    '1. 아프면 사형\n2. 일정공유 잘하기\n3. MM 확인 체크하기\n4. 부드러운 말투로 대화해용',
  );
  const [representativeCardId, setRepresentativeCardId] = useState<string>(ISSUED_CARDS[0].id);

  const representativeCard =
    ISSUED_CARDS.find(c => c.id === representativeCardId) ?? ISSUED_CARDS[0];

  useEffect(() => {
  const fetchGroupSettings = async () => {
    try {
      console.log('groupId 확인:', groupId);
      const data = await getGroupSettings(groupId);
      console.log('모임 설정 조회 성공:', data);
      console.log('result만 확인:', data.result);
    } catch (error: any) {
      console.error('error.response.data:', error?.response?.data);
    }
  };

  fetchGroupSettings();
}, [groupId]);


  const toggleTag = (tag: string) => {
    if (!isEdit) return;
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  const onToggleEdit = () => {
    if (!isAdmin) return;

    if (isEdit) {
      Alert.alert('저장', '모임 설정이 저장되었습니다.', [
        { text: '확인', onPress: () => setIsEdit(false) },
      ]);
    } else {
      setIsEdit(true);
    }
  };

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* 헤더 */}
        <View className="flex-row items-center justify-between mb-5">
          <Text
            style={{ fontSize: 20, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}
          >
            모임 정보
          </Text>
          {isAdmin && (
            <View className="flex-row items-center gap-4">
              {isEdit && (
                <Pressable
                  onPress={() => {
                    Alert.alert('확인', '수정 중인 내용이 있습니다. 취소할까요?', [
                      { text: '아니오', style: 'cancel' },
                      { text: '취소', style: 'destructive', onPress: () => setIsEdit(false) },
                    ]);
                  }}
                  hitSlop={12}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: '#6B7280',
                      fontFamily: 'GmarketSansTTFMedium',
                    }}
                  >
                    취소
                  </Text>
                </Pressable>
              )}
              <Pressable onPress={onToggleEdit} hitSlop={12}>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#1428A0',
                    fontFamily: 'GmarketSansTTFMedium',
                  }}
                >
                  {isEdit ? '저장' : '수정'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* 기본 정보 카드 */}
        <View
          className="bg-white rounded-3xl px-6 mb-4"
          style={{ shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 }}
        >
          {/* 모임명 */}
          <InfoRow label="모임명">
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'GmarketSansTTFBold',
                color: '#111827',
                textAlign: 'right',
              }}
            >
              {groupName}
            </Text>
          </InfoRow>

          {/* 모임소개 */}
          <InfoRow label="모임소개">
            {isEdit ? (
              <TextInput
                value={intro}
                onChangeText={setIntro}
                style={{
                  fontSize: 14,
                  color: '#111827',
                  fontFamily: 'GmarketSansTTFMedium',
                  textAlign: 'right',
                }}
              />
            ) : (
              <Text
                style={{
                  fontSize: 14,
                  color: '#111827',
                  fontFamily: 'GmarketSansTTFMedium',
                  textAlign: 'right',
                }}
              >
                {intro}
              </Text>
            )}
          </InfoRow>

          {/* 목적 태그 */}
          <InfoRow label="목적">
            <View className="flex-row flex-wrap justify-end gap-2">
              {isEdit
                ? TAGS.map(tag => (
                    <Pressable
                      key={tag}
                      onPress={() => toggleTag(tag)}
                      className="rounded-2xl px-3 py-1"
                      style={{
                        backgroundColor: selectedTags.includes(tag) ? '#1428A0' : '#F3F4F6',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: 'GmarketSansTTFMedium',
                          color: selectedTags.includes(tag) ? '#fff' : '#6B7280',
                        }}
                      >
                        {tag}
                      </Text>
                    </Pressable>
                  ))
                : selectedTags.map(tag => (
                    <View
                      key={tag}
                      className="rounded-2xl px-3 py-1"
                      style={{ backgroundColor: '#F3F4F6' }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: '#374151',
                          fontFamily: 'GmarketSansTTFMedium',
                        }}
                      >
                        {tag}
                      </Text>
                    </View>
                  ))}
            </View>
          </InfoRow>

          {/* 모임 개설일 */}
          <InfoRow label="모임 개설일">
            <Text
              style={{
                fontSize: 14,
                color: '#111827',
                fontFamily: 'GmarketSansTTFMedium',
                textAlign: 'right',
              }}
            >
              2026.2.19
            </Text>
          </InfoRow>

          {/* 회비 - 수정 모드 */}
          <View className="py-4">
            <View className="flex-row items-center mb-3">
              <Text
                style={{
                  width: 80,
                  fontSize: 14,
                  color: '#6B7280',
                  fontFamily: 'GmarketSansTTFMedium',
                }}
              >
                회비
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: '#111827',
                  fontFamily: 'GmarketSansTTFMedium',
                  textAlign: 'right',
                }}
              >
                {isEdit
                  ? `매월 / ${dues.day}일 / ${dues.amount}원`
                  : `매월 / ${dues.day}일 / ${dues.amount}원 / ${dues.rate}%`}
              </Text>
            </View>

            {isEdit && (
              <View style={{ gap: 8, paddingLeft: 80 }}>
                {/* 매월 + 일 */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{ fontSize: 13, color: '#000', fontFamily: 'GmarketSansTTFMedium' }}
                  >
                    매월
                  </Text>
                  <View
                    style={{
                      backgroundColor: '#E5E7EB',
                      borderRadius: 50,
                      paddingHorizontal: 20,
                      height: 32,
                      justifyContent: 'center',
                      alignItems: 'center',
                      minWidth: 80,
                    }}
                  >
                    <TextInput
                      value={dues.day}
                      onChangeText={v =>
                        setDues(prev => ({ ...prev, day: v.replace(/[^0-9]/g, '') }))
                      }
                      keyboardType="numeric"
                      style={{
                        fontSize: 16,
                        color: '#1428A0',
                        fontFamily: 'GmarketSansTTFMedium',
                        textAlign: 'center',
                        paddingVertical: 0,
                        height: '100%',
                        includeFontPadding: false,
                      }}
                    />
                  </View>
                  <Text
                    style={{ fontSize: 13, color: '#000', fontFamily: 'GmarketSansTTFMedium' }}
                  >
                    일
                  </Text>
                </View>

                {/* 금액 + 원 */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: '#E5E7EB',
                      borderRadius: 50,
                      paddingHorizontal: 20,
                      height: 32,
                      justifyContent: 'center',
                      alignItems: 'center',
                      minWidth: 120,
                    }}
                  >
                    <TextInput
                      value={dues.amount}
                      onChangeText={v =>
                        setDues(prev => ({ ...prev, amount: v.replace(/[^0-9,]/g, '') }))
                      }
                      keyboardType="numeric"
                      style={{
                        fontSize: 16,
                        color: '#1428A0',
                        fontFamily: 'GmarketSansTTFMedium',
                        textAlign: 'center',
                        padding: 0,
                      }}
                    />
                  </View>
                  <Text
                    style={{ fontSize: 13, color: '#000', fontFamily: 'GmarketSansTTFMedium' }}
                  >
                    원
                  </Text>
                </View>

                {/* 투표 기준 + % */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 8,
                  }}
                >
                  <Text
                    style={{ fontSize: 13, color: '#000', fontFamily: 'GmarketSansTTFMedium' }}
                  >
                    투표 기준
                  </Text>
                  <View
                    style={{
                      backgroundColor: '#E5E7EB',
                      borderRadius: 50,
                      paddingHorizontal: 20,
                      height: 32,
                      justifyContent: 'center',
                      alignItems: 'center',
                      minWidth: 80,
                    }}
                  >
                    <TextInput
                      value={dues.rate}
                      onChangeText={v =>
                        setDues(prev => ({ ...prev, rate: v.replace(/[^0-9]/g, '') }))
                      }
                      keyboardType="numeric"
                      style={{
                        fontSize: 16,
                        color: '#1428A0',
                        fontFamily: 'GmarketSansTTFMedium',
                        textAlign: 'center',
                        padding: 0,
                      }}
                    />
                  </View>
                  <Text
                    style={{ fontSize: 13, color: '#000', fontFamily: 'GmarketSansTTFMedium' }}
                  >
                    %
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* 그라운드룰 카드 */}
        <View
          className="bg-white rounded-3xl px-6 py-5 mb-4"
          style={{ shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 }}
        >
          <Text
            style={{ fontSize: 15, fontFamily: 'GmarketSansTTFBold', color: '#111827', marginBottom: 12 }}
          >
            그라운드룰
          </Text>
          {isEdit ? (
            <TextInput
              value={groundRules}
              onChangeText={setGroundRules}
              multiline
              style={{
                fontSize: 14,
                color: '#111827',
                fontFamily: 'GmarketSansTTFMedium',
                lineHeight: 22,
                textAlignVertical: 'top',
                minHeight: 100,
                backgroundColor: '#F9FAFB',
                borderRadius: 12,
                padding: 12,
              }}
            />
          ) : (
            <Text
              style={{
                fontSize: 14,
                color: '#374151',
                fontFamily: 'GmarketSansTTFMedium',
                lineHeight: 24,
              }}
            >
              {groundRules}
            </Text>
          )}
        </View>

        {/* 발급 카드 */}
        <View
          className="bg-white rounded-3xl px-6 py-5"
          style={{ shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text
              style={{ fontSize: 15, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}
            >
              {isEdit ? '발급 카드 목록' : '대표 카드'}
            </Text>
            {isEdit && (
              <Text
                style={{ fontSize: 12, color: '#1428A0', fontFamily: 'GmarketSansTTFMedium' }}
              >
                대표 카드를 선택하세요
              </Text>
            )}
          </View>

          {isEdit ? (
            <View style={{ gap: 12 }}>
              {ISSUED_CARDS.map(card => {
                const isRep = card.id === representativeCardId;
                return (
                  <Pressable
                    key={card.id}
                    onPress={() => setRepresentativeCardId(card.id)}
                    style={{
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: isRep ? '#1428A0' : 'transparent',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <Image source={card.image} style={{ width: '100%', height: 180 }} resizeMode="cover" />
                    {isRep && (
                      <View
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          backgroundColor: '#1428A0',
                          borderRadius: 20,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                        }}
                      >
                        <Text
                          style={{ fontSize: 11, color: '#fff', fontFamily: 'GmarketSansTTFMedium' }}
                        >
                          대표 카드 ✓
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Image
              source={representativeCard.image}
              style={{ width: '100%', height: 200, borderRadius: 16 }}
              resizeMode="cover"
            />
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}