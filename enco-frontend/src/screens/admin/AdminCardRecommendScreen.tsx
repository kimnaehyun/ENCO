// src/screens/admin/AdminCardRecommendScreen.tsx
// 카드 추가 발급 > 카드 추천/전체목록 — GroupCardRecommendScreen 디자인 기반
import React, { useMemo, useState } from 'react';
import { Alert, Image, TouchableOpacity, View, FlatList } from 'react-native'
import Text from '@/components/typography';;
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { GroupCardItem } from '../../types/group';

export default function AdminCardRecommendScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { groupId, groupName, tags } = route.params;
  const isRecommendMode = tags && tags.length > 0;

  const allCards = useMemo<GroupCardItem[]>(
    () => [
      {
        id: 'card-samsung-1',
        name: '삼성카드 A',
        brand: '삼성카드',
        imageUrl:
          'https://static11.samsungcard.com/wcms/svc/__icsFiles/artimage/2025/09/02/ccom02_1/dm_AAP1870_02.png',
        summary: '삼성카드 시리즈 A',
        detail: '일상 결제에 무난하게 어울리는 카드입니다.',
      },
      {
        id: 'card-samsung-2',
        name: '삼성카드 B',
        brand: '삼성카드',
        imageUrl:
          'https://static11.samsungcard.com/wcms/svc/__icsFiles/artimage/2025/09/02/ccom02_1/dm_AAP1870.png',
        summary: '삼성카드 시리즈 B',
        detail: '심플한 스타일의 카드입니다.',
      },
      {
        id: 'card-samsung-3',
        name: '삼성카드 C',
        brand: '삼성카드',
        imageUrl:
          'https://static11.samsungcard.com/wcms/svc/__icsFiles/artimage/2025/09/02/ccom02_1/dm_AAP1870_03.png',
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
    navigation.navigate('AdminCard', {
      groupId,
      groupName,
      selectedCardId,
      selectedCardImage: allCards.find((c) => c.id === selectedCardId)
        ?.imageUrl,
      selectedCardName: allCards.find((c) => c.id === selectedCardId)?.name,
      selectedTags: route.params?.prevTags ?? [],
      recommendPressed: route.params?.prevRecommendPressed ?? false,
      viewAllPressed: route.params?.prevViewAllPressed ?? false,
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
        <View
          style={{
            borderRadius: 14,
            overflow: 'hidden',
            backgroundColor: '#F9FAFB',
          }}
        >
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
      <Text variant="h2" color="dark"
        
       style={{ marginBottom: 6 }}>
        카드 추가 발급
      </Text>
      <Text variant="caption" color="placeholder"
        
       style={{ marginBottom: 24 }}>
        {groupName}
      </Text>
      <Text variant="bodySm" color="muted"
        
       style={{ marginBottom: 16 }}>
        {isRecommendMode
          ? `"${tags.join(', ')}" 태그 기반 추천 카드`
          : '전체 카드 목록'}
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
          <Text variant="bodySm" color="subtle"
            
          >
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
        <Text weight="bold" color="white"
          
        >
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

      {/* 카드 상세 모달 */}
      {detailCard && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
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
            <Text weight="bold" color="dark"
              
             style={{ marginBottom: 16, fontSize: 18 }}>
              {detailCard.name}
            </Text>

            <Image
              source={{ uri: detailCard.imageUrl }}
              style={{ width: '100%', aspectRatio: 2, borderRadius: 14 }}
              resizeMode="contain"
            />

            <Text variant="caption" color="placeholder"
              
             style={{ marginTop: 14 }}>
              {detailCard.brand}
            </Text>
            <Text variant="bodyMd" weight="bold" color="dark"
              
             style={{ marginTop: 4 }}>
              {detailCard.summary}
            </Text>
            <Text variant="bodySm" color="muted"
              
             style={{ marginTop: 8 }}>
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
                <Text variant="bodyMd" color="subtle"
                  
                >
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
                <Text variant="bodyMd" weight="bold" color="white"
                  
                >
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