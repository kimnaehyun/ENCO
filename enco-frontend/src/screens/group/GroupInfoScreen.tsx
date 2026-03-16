// src/screens/group/GroupInfoScreen.tsx
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';
import { images } from '../../types/images';

const TAGS = ['여행', '음식', '스터디', '운동', '문화', '게임', '기타'];

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="flex-row items-center py-4 border-b border-gray-100">
      <Text style={{ width: 80, fontSize: 14, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>
        {label}
      </Text>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

export default function GroupInfoScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;
  const groupName = params.groupName ?? '모임명';
  const isAdmin = !!params.isAdmin;

  const [isEdit, setIsEdit] = useState(false);
  const [intro, setIntro] = useState('회식좋아하는사람들');
  const [selectedTags, setSelectedTags] = useState<string[]>(['여행', '음식']);
  const [dues, setDues] = useState('매월 / 15일 / 10,000원 / 80%');
  const [groundRules, setGroundRules] = useState(
    '1. 아프면 사형\n2. 일정공유 잘하기\n3. MM 확인 체크하기\n4. 부드러운 말투로 대화해용'
  );

  // 임시 발급 카드 목록
  const issuedCards = [images.card1, images.card2];

  const toggleTag = (tag: string) => {
    if (!isEdit) return;
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
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

  const onPressClose = () => {
    if (isEdit) {
      Alert.alert('확인', '수정 중인 내용이 있습니다. 나갈까요?', [
        { text: '취소', style: 'cancel' },
        { text: '나가기', style: 'destructive', onPress: () => navigation.goBack() },
      ]);
      return;
    }
    navigation.goBack();
  };

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* 헤더 */}
        <View className="flex-row items-center justify-between mb-5">
          <Text style={{ fontSize: 20, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}>
            모임 정보
          </Text>
          <View className="flex-row items-center gap-4">
            {isAdmin && (
              <Pressable onPress={onToggleEdit} hitSlop={12}>
                <Text style={{ fontSize: 14, color: '#1428A0', fontFamily: 'GmarketSansTTFMedium' }}>
                  {isEdit ? '저장' : '수정'}
                </Text>
              </Pressable>
            )}
            <Pressable onPress={onPressClose} hitSlop={12}>
              <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>닫기</Text>
            </Pressable>
          </View>
        </View>

        {/* 기본 정보 카드 */}
        <View
          className="bg-white rounded-3xl px-6 mb-4"
          style={{ shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 }}
        >
          {/* 모임명 */}
          <InfoRow label="모임명">
            <Text style={{ fontSize: 18, fontFamily: 'GmarketSansTTFBold', color: '#111827', textAlign: 'right' }}>
              {groupName}
            </Text>
          </InfoRow>

          {/* 모임소개 */}
          <InfoRow label="모임소개">
            {isEdit ? (
              <TextInput
                value={intro}
                onChangeText={setIntro}
                style={{ fontSize: 14, color: '#111827', fontFamily: 'GmarketSansTTFMedium', textAlign: 'right' }}
              />
            ) : (
              <Text style={{ fontSize: 14, color: '#111827', fontFamily: 'GmarketSansTTFMedium', textAlign: 'right' }}>
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
                    style={{ backgroundColor: selectedTags.includes(tag) ? '#1428A0' : '#F3F4F6' }}
                  >
                    <Text style={{
                      fontSize: 13,
                      fontFamily: 'GmarketSansTTFMedium',
                      color: selectedTags.includes(tag) ? '#fff' : '#6B7280',
                    }}>
                      {tag}
                    </Text>
                  </Pressable>
                ))
                : selectedTags.map(tag => (
                  <View key={tag} className="rounded-2xl px-3 py-1" style={{ backgroundColor: '#F3F4F6' }}>
                    <Text style={{ fontSize: 13, color: '#374151', fontFamily: 'GmarketSansTTFMedium' }}>
                      {tag}
                    </Text>
                  </View>
                ))
              }
            </View>
          </InfoRow>

          {/* 모임 개설일 */}
          <InfoRow label="모임 개설일">
            <Text style={{ fontSize: 14, color: '#111827', fontFamily: 'GmarketSansTTFMedium', textAlign: 'right' }}>
              2026.2.19
            </Text>
          </InfoRow>

          {/* 회비 */}
          <View className="flex-row items-center py-4">
            <Text style={{ width: 80, fontSize: 14, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>
              회비
            </Text>
            {isEdit ? (
              <TextInput
                value={dues}
                onChangeText={setDues}
                style={{ flex: 1, fontSize: 13, color: '#111827', fontFamily: 'GmarketSansTTFMedium', textAlign: 'right' }}
              />
            ) : (
              <Text style={{ flex: 1, fontSize: 13, color: '#111827', fontFamily: 'GmarketSansTTFMedium', textAlign: 'right' }}>
                {dues}
              </Text>
            )}
          </View>
        </View>

        {/* 그라운드룰 카드 */}
        <View
          className="bg-white rounded-3xl px-6 py-5 mb-4"
          style={{ shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 }}
        >
          <Text style={{ fontSize: 15, fontFamily: 'GmarketSansTTFBold', color: '#111827', marginBottom: 12 }}>
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
            <Text style={{ fontSize: 14, color: '#374151', fontFamily: 'GmarketSansTTFMedium', lineHeight: 24 }}>
              {groundRules}
            </Text>
          )}
        </View>

        {/* 발급 카드 */}

        <View
          className="bg-white rounded-3xl px-6 py-5"
          style={{ shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 }}
        >
          <Text style={{ fontSize: 15, fontFamily: 'GmarketSansTTFBold', color: '#111827', marginBottom: 16 }}>
            발급 카드
          </Text>
          <Image
            source={{ uri: 'https://static11.samsungcard.com/wcms/svc/__icsFiles/artimage/2025/09/02/ccom02_1/dm_AAP1870_02.png' }}
            style={{ width: '100%', height: 240, borderRadius: 16 }}
            resizeMode="cover"
          />
        </View>

      </ScrollView>
    </ScreenLayout>
  );
}