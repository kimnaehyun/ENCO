import React, { useMemo, useState, useEffect } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';

const TAG_OPTIONS = ['여행', '스포츠', '문화생활', '경조사', '공과금', '음식'];

export default function GroupCreateScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const manager = useMemo(
    () => ({
      name: '나기',
      email: 'test@test.com',
      phone: '010-1234-5678',
    }),
    []
  );

  const [groupName, setGroupName] = useState(route.params?.groupName ?? '');
  const [selectedTags, setSelectedTags] = useState<string[]>(route.params?.selectedTags ?? []);
  const [selectedCardId, setSelectedCardId] = useState(route.params?.selectedCardId ?? null);
  const [selectedCardImage, setSelectedCardImage] = useState(route.params?.selectedCardImage ?? null);
  const [selectedCardName, setSelectedCardName] = useState(route.params?.selectedCardName ?? null);
  const [recommendPressed, setRecommendPressed] = useState(route.params?.recommendPressed ?? false);
  const [viewAllPressed, setViewAllPressed] = useState(route.params?.viewAllPressed ?? false);

  // 카드 선택 후 돌아왔을 때 params 동기화
  useEffect(() => {
    if (route.params?.selectedCardId) {
      setSelectedCardId(route.params.selectedCardId);
      setSelectedCardImage(route.params.selectedCardImage ?? null);
      setSelectedCardName(route.params.selectedCardName ?? null);
      setRecommendPressed(route.params.recommendPressed ?? false);
      setViewAllPressed(route.params.viewAllPressed ?? false);
    }
  }, [route.params?.selectedCardId]);

  const canGoNext = groupName.trim().length > 0 && selectedTags.length > 0;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const handleRecommend = () => {
    if (!groupName.trim()) {
      Alert.alert('안내', '모임명을 입력해주세요.');
      return;
    }
    if (selectedTags.length === 0) {
      Alert.alert('안내', '모임 성향을 1개 이상 선택해주세요.');
      return;
    }
    navigation.navigate('GroupCardRecommend', {
      groupName,
      address: '',
      tags: selectedTags,
      prevGroupName: groupName,
      prevTags: selectedTags,
      prevRecommendPressed: true,
      prevViewAllPressed: viewAllPressed,
    });
  };

  const handleViewAll = () => {
    navigation.navigate('GroupCardRecommend', {
      groupName,
      address: '',
      tags: [],
      prevGroupName: groupName,
      prevTags: selectedTags,
      prevRecommendPressed: recommendPressed,
      prevViewAllPressed: true,
    });
  };

  const handleSubmit = () => {
    if (!groupName.trim()) {
      Alert.alert('안내', '모임명을 입력해주세요.');
      return;
    }
    if (selectedTags.length === 0) {
      Alert.alert('안내', '모임 성향을 1개 이상 선택해주세요.');
      return;
    }
    if (!selectedCardId) {
      Alert.alert('안내', '카드를 선택해주세요.');
      return;
    }
    navigation.navigate('GroupPinSetup', {
      groupName,
      address: '',
      tags: selectedTags,
      selectedCardId,
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
            marginBottom: 28,
          }}
        >
          모임통장 개설하기
        </Text>

        {/* 총무 정보 */}
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
            { label: '이름', value: manager.name },
            { label: '이메일', value: manager.email },
            { label: '전화번호', value: manager.phone },
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
              <Text style={{ fontSize: 14, color: '#9CA3AF', fontFamily: 'GmarketSansTTFMedium' }}>
                {item.label}
              </Text>
              <Text style={{ fontSize: 14, color: '#111827', fontFamily: 'GmarketSansTTFMedium' }}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* 모임명 */}
        <Text
          style={{
            fontSize: 14,
            color: '#6B7280',
            fontFamily: 'GmarketSansTTFMedium',
            marginBottom: 8,
          }}
        >
          모임명
        </Text>
        <TextInput
          value={groupName}
          onChangeText={setGroupName}
          placeholder="모임명을 입력해주세요"
          placeholderTextColor="#9CA3AF"
          style={{
            height: 56,
            borderRadius: 16,
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 18,
            fontSize: 15,
            color: '#111827',
            fontFamily: 'GmarketSansTTFMedium',
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1,
          }}
        />

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
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
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
                <Text style={{ fontSize: 15, color: '#FFFFFF', fontFamily: 'GmarketSansTTFBold' }}>
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
              <Text style={{
                color: '#FFFFFF',
                fontSize: 14,
                fontFamily: 'GmarketSansTTFBold',
              }}>
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
              <Text style={{
                color: '#FFFFFF',
                fontSize: 14,
                fontFamily: 'GmarketSansTTFBold',
              }}>
                전체 카드 보기
              </Text>
            </Pressable>
          </View>

          {/* 개설하기 - 카드 선택 후에만 표시 */}
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
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'GmarketSansTTFBold' }}>
                모임통장 개설하기
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}