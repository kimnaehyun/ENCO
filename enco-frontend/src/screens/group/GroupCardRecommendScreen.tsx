import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { GroupCardItem, CardRecommendRouteProp } from '../../types/group';

export default function GroupCardRecommendScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<CardRecommendRouteProp>();

  const { groupName, address, tags } = route.params;
  const isRecommendMode = tags && tags.length > 0;

  const allCards = useMemo<GroupCardItem[]>(
    () => [
      {
        id: 'card-samsung-1',
        name: '삼성카드 A',
        brand: '삼성카드',
        imageUrl: 'https://static11.samsungcard.com/wcms/svc/__icsFiles/artimage/2025/09/02/ccom02_1/dm_AAP1870_02.png',
        summary: '삼성카드 시리즈 A',
        detail: '일상 결제에 무난하게 어울리는 카드입니다.',
      },
      {
        id: 'card-samsung-2',
        name: '삼성카드 B',
        brand: '삼성카드',
        imageUrl: 'https://static11.samsungcard.com/wcms/svc/__icsFiles/artimage/2025/09/02/ccom02_1/dm_AAP1870.png',
        summary: '삼성카드 시리즈 B',
        detail: '심플한 스타일의 카드입니다.',
      },
      {
        id: 'card-samsung-3',
        name: '삼성카드 C',
        brand: '삼성카드',
        imageUrl: 'https://static11.samsungcard.com/wcms/svc/__icsFiles/artimage/2025/09/02/ccom02_1/dm_AAP1870_03.png',
        summary: '삼성카드 시리즈 C',
        detail: '포인트 컬러가 있는 카드입니다.',
      },
    ],
    []
  );

  const INITIAL_COUNT = 4;
  const [showAll, setShowAll] = useState(false);
  const recommendedCards = allCards.slice(0, 2);
  const displayCards = isRecommendMode
    ? recommendedCards
    : showAll
    ? allCards
    : allCards.slice(0, INITIAL_COUNT);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [detailCard, setDetailCard] = useState<GroupCardItem | null>(null);

  const handleComplete = () => {
  if (!selectedCardId) {
    Alert.alert('안내', '카드를 하나 선택해주세요.');
    return;
  }
  navigation.navigate('GroupCreate', {
    selectedCardId,
    selectedCardImage: allCards.find(c => c.id === selectedCardId)?.imageUrl,
    selectedCardName: allCards.find(c => c.id === selectedCardId)?.name,
    groupName: route.params?.prevGroupName ?? '',
    selectedTags: route.params?.prevTags ?? [],
    recommendPressed: route.params?.prevRecommendPressed ?? false,  // ← 추가
    viewAllPressed: route.params?.prevViewAllPressed ?? false,       // ← 추가
  });
};
  const renderItem = ({ item }: { item: GroupCardItem }) => {
    const selected = selectedCardId === item.id;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setDetailCard(item)}
        style={{
          borderRadius: 16,
          borderWidth: 2,
          borderColor: selected ? '#1428A0' : 'transparent',
          marginBottom: 14,
          shadowColor: selected ? '#1428A0' : '#000',
          shadowOffset: { width: 0, height: selected ? 4 : 1 },
          shadowOpacity: selected ? 0.2 : 0.06,
          shadowRadius: selected ? 8 : 4,
          elevation: selected ? 4 : 1,
        }}
      >
        <View style={{ borderRadius: 14, overflow: 'hidden', backgroundColor: '#F9FAFB' }}>
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: '100%', aspectRatio: 2 }}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <>
      <Text
        style={{
          fontSize: 22,
          color: '#111827',
          fontFamily: 'GmarketSansTTFBold',
          marginBottom: 24,
        }}
      >
        모임통장 개설하기
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: '#6B7280',
          fontFamily: 'GmarketSansTTFMedium',
          marginBottom: 16,
        }}
      >
        {isRecommendMode ? `"${tags.join(', ')}" 태그 기반 추천 카드` : '전체 카드 목록'}
      </Text>
    </>
  );

  const ListFooter = () => (
    <>
      {!isRecommendMode && !showAll && allCards.length > INITIAL_COUNT && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowAll(true)}
          style={{
            marginTop: 4,
            height: 48,
            borderRadius: 14,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 14, color: '#374151', fontFamily: 'GmarketSansTTFMedium' }}>
            더보기
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleComplete}
        disabled={!selectedCardId}
        style={{
          marginTop: 24,
          height: 54,
          borderRadius: 16,
          backgroundColor: '#1428A0',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: selectedCardId ? 1 : 0.4,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'GmarketSansTTFBold' }}>
          완료
        </Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScreenLayout>
        <FlatList
          data={displayCards}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          showsVerticalScrollIndicator={false}
        />
      </ScreenLayout>

      {detailCard && (
        <View
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(17,24,39,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
            zIndex: 999,
          }}
        >
          <View
            style={{
              width: '100%',
              borderRadius: 24,
              backgroundColor: '#FFFFFF',
              padding: 22,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                color: '#111827',
                fontFamily: 'GmarketSansTTFBold',
                marginBottom: 16,
              }}
            >
              {detailCard.name}
            </Text>

            <Image
              source={{ uri: detailCard.imageUrl }}
              style={{ width: '100%', aspectRatio: 2, borderRadius: 14 }}
              resizeMode="contain"
            />

            <Text
              style={{
                marginTop: 14,
                fontSize: 13,
                color: '#9CA3AF',
                fontFamily: 'GmarketSansTTFMedium',
              }}
            >
              {detailCard.brand}
            </Text>
            <Text
              style={{
                marginTop: 4,
                fontSize: 15,
                color: '#111827',
                fontFamily: 'GmarketSansTTFBold',
              }}
            >
              {detailCard.summary}
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontSize: 14,
                color: '#6B7280',
                fontFamily: 'GmarketSansTTFMedium',
                lineHeight: 22,
              }}
            >
              {detailCard.detail}
            </Text>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setDetailCard(null)}
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 14,
                  backgroundColor: '#F3F4F6',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 15, color: '#374151', fontFamily: 'GmarketSansTTFMedium' }}>
                  닫기
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedCardId(detailCard.id);
                  setDetailCard(null);
                }}
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 14,
                  backgroundColor: '#1428A0',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 15, color: '#FFFFFF', fontFamily: 'GmarketSansTTFBold' }}>
                  이 카드 선택
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}