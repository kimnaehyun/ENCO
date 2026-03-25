import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, TouchableOpacity, View, FlatList } from 'react-native'
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';;
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { getCardList, getCardDetail, CardListItem } from '../../services/paymentService';

type DisplayCard = {
  id: number;
  name: string;
  brand: string;
  imageUrl: string;
  backImageUrl: string;
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
          backImageUrl: card.backImageUrl,
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
        backImageUrl: d.backImageUrl || card.backImageUrl,
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
        style={[styles.cardItem, selected && styles.cardItemSelected]}
      >
        <View style={styles.cardImageWrap}>
          <View style={styles.cardImageRow}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.cardImageHalf}
              resizeMode="contain"
            />
            <Image
              source={{ uri: item.backImageUrl }}
              style={styles.cardImageHalf}
              resizeMode="contain"
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <>
      <Text style={styles.pageTitle}>모임통장 개설하기</Text>
      <Text style={styles.pageSubtitle}>
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
          style={styles.showMoreButton}
        >
          <Text style={styles.showMoreText}>더보기</Text>
        </TouchableOpacity>
      )}
      {/* 하단 고정 버튼 영역만큼 여백 확보 */}
      <View style={{ height: 90 }} />
    </>
  );

  if (loading) {
    return (
      <ScreenLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1428A0" />
          <Text style={styles.loadingText}>카드 목록을 불러오는 중...</Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenLayout>
        <FlatList
          data={displayCards}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>조회된 카드가 없습니다.</Text>
            </View>
          }
        />
      </ScreenLayout>

      {/* 하단 고정 완료 버튼 */}
      <View style={styles.fixedBottomContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleComplete}
          disabled={!selectedCardId}
          style={[styles.completeButton, !selectedCardId && styles.completeButtonDisabled]}
        >
          <Text style={styles.completeButtonText}>완료</Text>
        </TouchableOpacity>
      </View>

      {/* 카드 상세 모달 */}
      {detailCard && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalCardName}>{detailCard.name}</Text>

            <View style={styles.cardImageRow}>
              <Image
                source={{ uri: detailCard.imageUrl }}
                style={styles.modalCardImageHalf}
                resizeMode="contain"
              />
              <Image
                source={{ uri: detailCard.backImageUrl }}
                style={styles.modalCardImageHalf}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.modalBrand}>{detailCard.brand}</Text>
            <Text style={styles.modalSummary}>{detailCard.summary}</Text>
            <Text style={styles.modalDetail}>
              {detailLoading ? '상세 정보를 불러오는 중...' : detailCard.detail}
            </Text>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setDetailCard(null)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>닫기</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedCardId(detailCard.id);
                  setDetailCard(null);
                }}
                style={styles.modalSelectButton}
              >
                <Text style={styles.modalSelectText}>이 카드 선택</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── 로딩 ──────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },

  // ── 헤더 ──────────────────────────────────
  pageTitle: {
    fontSize: 22,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 24,
  },
  pageSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    marginBottom: 16,
  },

  // ── 카드 아이템 ───────────────────────────
  cardItem: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  cardItemSelected: {
    borderColor: '#1428A0',
    shadowColor: '#1428A0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImageWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    padding: 8,
  },
  cardImageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cardImageHalf: {
    flex: 1,
    aspectRatio: 0.63,
  },

  // ── 빈 목록 ───────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
  },

  // ── 더보기 / 완료 버튼 ────────────────────
  showMoreButton: {
    marginTop: 4,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 14,
    color: COLORS.subtle,
    fontFamily: FONT_FAMILY.medium,
  },
  // ── 하단 고정 완료 버튼 ─────────────────
  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  completeButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#1428A0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButtonDisabled: {
    opacity: 0.4,
  },
  completeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
  },

  // ── 상세 모달 ─────────────────────────────
  modalOverlay: {
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
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 22,
  },
  modalCardName: {
    fontSize: 18,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 16,
  },
  modalCardImageHalf: {
    flex: 1,
    aspectRatio: 0.63,
    borderRadius: 14,
  },
  modalBrand: {
    marginTop: 14,
    fontSize: 13,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
  },
  modalSummary: {
    marginTop: 4,
    fontSize: 15,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },
  modalDetail: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    lineHeight: 22,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalCloseButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 15,
    color: COLORS.subtle,
    fontFamily: FONT_FAMILY.medium,
  },
  modalSelectButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#1428A0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSelectText: {
    fontSize: 15,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },
});