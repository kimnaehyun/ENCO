import React, { useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
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
import { useAuthStore } from '../../store/useAuthStore';
import { getGroupType, GroupTypeItem } from '../../services/authService';

export default function GroupCreateScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // ── 프로필 정보 (store에서 가져오기) ──
  const user = useAuthStore(s => s.user);
  const profile = useAuthStore(s => s.profile);

  const manager = useMemo(
    () => ({
      name: profile?.name ?? user ?? '',
      email: profile?.email ?? '',
      phone: profile?.phoneNumber ?? '',
    }),
    [profile, user],
  );

  // ── 모임 성향 태그: API에서 동적 로딩 ──
  const [tagOptions, setTagOptions] = useState<GroupTypeItem[]>([]);
  const [tagLoading, setTagLoading] = useState(true);

  const FALLBACK_TAGS: GroupTypeItem[] = [
    { typeId: 1, typeName: '여행' },
    { typeId: 2, typeName: '스포츠' },
    { typeId: 3, typeName: '문화생활' },
    { typeId: 4, typeName: '경조사' },
    { typeId: 5, typeName: '공과금' },
    { typeId: 6, typeName: '음식' },
  ];

  useEffect(() => {
    getGroupType()
      .then(res => {
        console.log('[GroupCreate] GET /groups/types 응답:', JSON.stringify(res, null, 2));
        const list = res?.result;
        if (Array.isArray(list) && list.length > 0) {
          setTagOptions(list);
        } else {
          console.warn('[GroupCreate] 모임 타입 응답이 비어있음, 폴백 사용');
          setTagOptions(FALLBACK_TAGS);
        }
      })
      .catch(err => {
        console.warn('[GroupCreate] 모임 타입 조회 실패:', err);
        setTagOptions(FALLBACK_TAGS);
      })
      .finally(() => setTagLoading(false));
  }, []);

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

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((item) => item !== tagName) : [...prev, tagName]
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

        {tagLoading ? (
          <ActivityIndicator
            size="small"
            color="#1428A0"
            style={{ marginVertical: 24 }}
          />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
            {tagOptions.map((tag) => {
              const selected = selectedTags.includes(tag.typeName);
              return (
                <Pressable
                  key={tag.typeId}
                  onPress={() => toggleTag(tag.typeName)}
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
                    {tag.typeName}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

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