import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { getCardList, getCardDetail, CardListItem } from '../../services/paymentService';

type DisplayCard = {
  id: number;
  name: string;
  brand: string;
  imageUrl: string;
  summary: string;
  detail: string;
  benefits: { categoryName: string; discountRate: number }[];
};

export default function GroupCardRecommendScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { groupName, address, tags } = route.params;
  const isRecommendMode = tags && tags.length > 0;

  // ── API에서 카드 목록 로딩 ──
  const [allCards, setAllCards] = useState<DisplayCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        // GET /cards → { message, result: CardListItem[] }
        const res = await getCardList();
        console.log('[GroupCardRecommend] GET /cards 응답:', JSON.stringify(res, null, 2));

        const list = res?.result ?? [];
        const cards: DisplayCard[] = (Array.isArray(list) ? list : []).map(card => ({
          id: card.id,
          name: card.name,
          brand: '삼성카드',
          imageUrl: card.frontImageUrl,
          summary: card.name,
          detail: (card.benefits ?? [])
            .map(b => `${b.categoryName} ${b.discountRate}%`)
            .join(', '),
          benefits: card.benefits ?? [],
        }));

        console.log('[GroupCardRecommend] 변환된 카드 수:', cards.length);
        setAllCards(cards);
      } catch (err) {
        console.warn('[GroupCardRecommend] 카드 목록 조회 실패:', err);
        Alert.alert('오류', '카드 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  const INITIAL_COUNT = 4;
  const [showAll, setShowAll] = useState(false);
  const displayCards = isRecommendMode
    ? allCards
    : showAll
    ? allCards
    : allCards.slice(0, INITIAL_COUNT);

  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [detailCard, setDetailCard] = useState<DisplayCard | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 카드 탭 → 상세 정보 API 호출
  const handleCardPress = async (card: DisplayCard) => {
    setDetailLoading(true);
    setDetailCard(card);
    try {
      // GET /cards/{id} → { message, result: CardDetailResult }
      const res = await getCardDetail(card.id);
      console.log(`[GroupCardRecommend] GET /cards/${card.id} 응답:`, JSON.stringify(res, null, 2));
      const d = res.result;
      setDetailCard({
        ...card,
        name: d.name,
        summary: d.description,
        detail: `기본 실적 ${Number(d.baseSpending).toLocaleString()}원 · 월 최대 혜택 ${Number(d.maxBenefitLimit).toLocaleString()}원 · 한도 ${Number(d.maxLimit).toLocaleString()}원`,
        imageUrl: d.frontImageUrl || card.imageUrl,
      });
    } catch (err) {
      console.warn(`[GroupCardRecommend] 카드 상세 조회 실패 (id=${card.id}):`, err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleComplete = () => {
    if (!selectedCardId) {
      Alert.alert('안내', '카드를 하나 선택해주세요.');
      return;
    }
    const selected = allCards.find(c => c.id === selectedCardId);
    console.log('[GroupCardRecommend] 카드 선택 완료:', { selectedCardId, name: selected?.name });
    navigation.navigate('GroupCreate', {
      selectedCardId: String(selectedCardId),
      selectedCardImage: selected?.imageUrl,
      selectedCardName: selected?.name,
      groupName: route.params?.prevGroupName ?? '',
      selectedTags: route.params?.prevTags ?? [],
      recommendPressed: route.params?.prevRecommendPressed ?? false,
      viewAllPressed: route.params?.prevViewAllPressed ?? false,
    });
  };

  const renderItem = ({ item }: { item: DisplayCard }) => {
    const selected = selectedCardId === item.id;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleCardPress(item)}
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

  if (loading) {
    return (
      <ScreenLayout>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#1428A0" />
          <Text
            style={{
              marginTop: 16,
              fontSize: 14,
              color: '#6B7280',
              fontFamily: 'GmarketSansTTFMedium',
            }}
          >
            카드 목록을 불러오는 중...
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScreenLayout>
        <FlatList
          data={displayCards}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: '#9CA3AF',
                  fontFamily: 'GmarketSansTTFMedium',
                }}
              >
                조회된 카드가 없습니다.
              </Text>
            </View>
          }
        />
      </ScreenLayout>

      {/* 카드 상세 모달 */}
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
              {detailLoading ? '상세 정보를 불러오는 중...' : detailCard.detail}
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