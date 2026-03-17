// src/screens/admin/AdminCardScreen.tsx
// 카드 추가 발급 — GroupCreateScreen 디자인 기반
import React, { useMemo, useState, useEffect } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';

const TAG_OPTIONS = ['여행', '스포츠', '문화생활', '경조사', '공과금', '음식'];

export default function AdminCardScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = (route.params ?? {}) as CommonParams & {
    selectedCardId?: string;
    selectedCardImage?: string;
    selectedCardName?: string;
    selectedTags?: string[];
    recommendPressed?: boolean;
    viewAllPressed?: boolean;
  };

  const groupName = params.groupName ?? '모임명';
  const groupId = params.groupId;

  // 총무 정보 (자동 입력)
  const treasurer = useMemo(
    () => ({
      name: '나기',
      email: 'test@test.com',
      phone: '010-1234-5678',
    }),
    []
  );

  // 상태 관리
  const [selectedTags, setSelectedTags] = useState<string[]>(
    params.selectedTags ?? []
  );
  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    params.selectedCardId ?? null
  );
  const [selectedCardImage, setSelectedCardImage] = useState<string | null>(
    params.selectedCardImage ?? null
  );
  const [selectedCardName, setSelectedCardName] = useState<string | null>(
    params.selectedCardName ?? null
  );
  const [recommendPressed, setRecommendPressed] = useState(
    params.recommendPressed ?? false
  );
  const [viewAllPressed, setViewAllPressed] = useState(
    params.viewAllPressed ?? false
  );

  // 카드 선택 후 돌아왔을 때 params 동기화
  useEffect(() => {
    if (route.params?.selectedCardId) {
      setSelectedCardId(route.params.selectedCardId);
      setSelectedCardImage(route.params.selectedCardImage ?? null);
      setSelectedCardName(route.params.selectedCardName ?? null);
      setRecommendPressed(route.params.recommendPressed ?? false);
      setViewAllPressed(route.params.viewAllPressed ?? false);
    }
    if (route.params?.selectedTags) {
      setSelectedTags(route.params.selectedTags);
    }
  }, [
    route.params?.selectedCardId,
    route.params?.selectedCardImage,
    route.params?.selectedCardName,
    route.params?.recommendPressed,
    route.params?.viewAllPressed,
    route.params?.selectedTags,
  ]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleRecommend = () => {
    if (selectedTags.length === 0) {
      Alert.alert('안내', '모임 성향을 1개 이상 선택해주세요.');
      return;
    }
    navigation.navigate('AdminCardRecommend', {
      groupId,
      groupName,
      tags: selectedTags,
      prevTags: selectedTags,
      prevRecommendPressed: true,
      prevViewAllPressed: viewAllPressed,
    });
  };

  const handleViewAll = () => {
    navigation.navigate('AdminCardRecommend', {
      groupId,
      groupName,
      tags: [],
      prevTags: selectedTags,
      prevRecommendPressed: recommendPressed,
      prevViewAllPressed: true,
    });
  };

  const handleSubmit = () => {
    if (selectedTags.length === 0) {
      Alert.alert('안내', '모임 성향을 1개 이상 선택해주세요.');
      return;
    }
    if (!selectedCardId) {
      Alert.alert('안내', '카드를 선택해주세요.');
      return;
    }
    navigation.navigate('AdminCardPin', {
      groupId,
      groupName,
      tags: selectedTags,
      selectedCardId,
      selectedCardName,
    });
  };

  return (
    <ScreenLayout>
      <ScrollView
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <Text
          style={{
            fontSize: 22,
            color: '#111827',
            fontFamily: 'GmarketSansTTFBold',
            marginBottom: 6,
          }}
        >
          카드 추가 발급
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: '#9CA3AF',
            fontFamily: 'GmarketSansTTFMedium',
            marginBottom: 28,
          }}
        >
          {groupName}
        </Text>

        {/* 총무 정보(자동 입력) */}
        <Text
          style={{
            fontSize: 14,
            color: '#6B7280',
            fontFamily: 'GmarketSansTTFMedium',
            marginBottom: 8,
          }}
        >
          총무 정보(자동 입력)
        </Text>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            paddingHorizontal: 18,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          {[
            { label: '이름', value: treasurer.name },
            { label: '이메일', value: treasurer.email },
            { label: '전화번호', value: treasurer.phone },
          ].map((item, i) => (
            <View
              key={item.label}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 14,
                borderBottomWidth: i < 2 ? 1 : 0,
                borderBottomColor: '#F3F4F6',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: '#9CA3AF',
                  fontFamily: 'GmarketSansTTFMedium',
                }}
              >
                {item.label}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: '#111827',
                  fontFamily: 'GmarketSansTTFMedium',
                }}
              >
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* 모임 성향 태그 */}
        <Text
          style={{
            fontSize: 14,
            color: '#6B7280',
            fontFamily: 'GmarketSansTTFMedium',
            marginBottom: 12,
          }}
        >
          모임 성향(옵션 태그)
        </Text>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 6,
          }}
        >
          {TAG_OPTIONS.map((tag) => {
            const selected = selectedTags.includes(tag);
            return (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                style={{
                  width: '31%',
                  paddingVertical: 18,
                  borderRadius: 18,
                  backgroundColor: selected ? '#1428A0' : '#C7D2FE',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: selected ? '#1428A0' : '#000',
                  shadowOffset: { width: 0, height: selected ? 4 : 1 },
                  shadowOpacity: selected ? 0.25 : 0.05,
                  shadowRadius: selected ? 8 : 4,
                  elevation: selected ? 4 : 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color: '#FFFFFF',
                    fontFamily: 'GmarketSansTTFBold',
                  }}
                >
                  {tag}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text
          style={{
            fontSize: 12,
            color: '#9CA3AF',
            fontFamily: 'GmarketSansTTFMedium',
            textAlign: 'center',
            marginBottom: 28,
          }}
        >
          중복 선택 가능
        </Text>

        {/* 선택된 카드 프리뷰 */}
        {selectedCardImage && (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: 18,
              alignItems: 'center',
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: '#9CA3AF',
                fontFamily: 'GmarketSansTTFMedium',
                marginBottom: 12,
              }}
            >
              선택한 카드
            </Text>
            <Image
              source={{ uri: selectedCardImage }}
              style={{ width: '60%', aspectRatio: 2, borderRadius: 12 }}
              resizeMode="contain"
            />
            <Text
              style={{
                marginTop: 10,
                fontSize: 14,
                color: '#111827',
                fontFamily: 'GmarketSansTTFBold',
              }}
            >
              {selectedCardName}
            </Text>
          </View>
        )}

        {/* 버튼 */}
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={() => {
                setRecommendPressed(true);
                handleRecommend();
              }}
              style={{
                flex: 1,
                height: 54,
                borderRadius: 16,
                backgroundColor: recommendPressed ? '#C7D2FE' : '#1428A0',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontFamily: 'GmarketSansTTFBold',
                }}
              >
                카드 추천 받기
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setViewAllPressed(true);
                handleViewAll();
              }}
              style={{
                flex: 1,
                height: 54,
                borderRadius: 16,
                backgroundColor: viewAllPressed ? '#C7D2FE' : '#1428A0',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontFamily: 'GmarketSansTTFBold',
                }}
              >
                전체 카드 보기
              </Text>
            </Pressable>
          </View>

          {/* 발급 신청 — 카드 선택 후에만 표시 */}
          {selectedCardId && (
            <Pressable
              onPress={handleSubmit}
              style={{
                height: 54,
                borderRadius: 16,
                backgroundColor: '#1428A0',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontFamily: 'GmarketSansTTFBold',
                }}
              >
                카드 발급 신청하기
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}