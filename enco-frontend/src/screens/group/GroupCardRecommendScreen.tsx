// src/screens/group/GroupCardRecommendScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { ROUTES } from '../../navigation/routes';
import type { GroupStackParamList } from '../../navigation/GroupStackNavigator';

type CardRecommendRouteProp = RouteProp<GroupStackParamList, 'GroupCardRecommend'>;

type CardItem = {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  summary: string;
  detail: string;
};

export default function GroupCardRecommendScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<CardRecommendRouteProp>();
  const { groupName, address, tags } = route.params;

  const cards = useMemo<CardItem[]>(
    () => [
      {
        id: 'card-shinhan-1',
        name: '신한카드 Deep Mock',
        brand: '신한카드',
        imageUrl:
          'https://www.shinhancard.com/_ICSFiles/afieldfile/2020/01/21/pc_card_600x380.png',
        summary: '무난한 메인 카드',
        detail:
          '일상 결제에 무난하게 어울리는 카드입니다. 모임통장 대표 카드 목업용으로 사용합니다.',
      },
      {
        id: 'card-bc-1',
        name: 'BC Card Mock A',
        brand: 'BC카드',
        imageUrl: 'https://bccard.com/images/individual/card/renew/list/card_771291.png',
        summary: '깔끔한 디자인',
        detail:
          '심플한 스타일의 카드입니다. 와이어프레임 확인용 목업 카드로 사용할 수 있습니다.',
      },
      {
        id: 'card-bc-2',
        name: 'BC Card Mock B',
        brand: 'BC카드',
        imageUrl: 'https://bccard.com/images/individual/card/renew/list/card_323761.png',
        summary: '밝은 톤 카드',
        detail:
          '조금 더 밝은 톤의 카드입니다. 팀 분위기나 태그와 연결해서 추천 카드처럼 보여줄 수 있습니다.',
      },
      {
        id: 'card-kb-1',
        name: 'KB Card Mock',
        brand: 'KB국민카드',
        imageUrl: 'https://img1.kbcard.com/ST/img/cxc/kbcard/upload/img/product/04240_img.png',
        summary: '포인트 컬러 카드',
        detail:
          '강한 포인트 컬러가 있는 카드입니다. 선택 시 대표 카드처럼 저장해서 다음 단계로 전달합니다.',
      },
    ],
    []
  );

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [detailCard, setDetailCard] = useState<CardItem | null>(null);

  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? null;

  const handleComplete = () => {
    if (!selectedCardId) {
      Alert.alert('안내', '카드를 하나 선택해주세요.');
      return;
    }

    navigation.navigate(ROUTES.GROUP_PIN_SETUP as any, {
      groupName,
      address,
      tags,
      selectedCardId,
    });
  };

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>추천 카드</Text>
        <Text style={styles.subTitle}>카드를 누르면 상세 정보가 열립니다</Text>

        <View style={styles.grid}>
          {cards.map((card) => {
            const selected = selectedCardId === card.id;

            return (
              <View key={card.id} style={styles.cardWrapper}>
                <Pressable
                  onPress={() => setDetailCard(card)}
                  style={[styles.cardButton, selected && styles.cardButtonSelected]}
                >
                  <Image source={{ uri: card.imageUrl }} style={styles.cardImage} resizeMode="cover" />
                </Pressable>

                <Text style={styles.cardName}>{card.name}</Text>

                <Pressable
                  onPress={() => setSelectedCardId(card.id)}
                  style={[styles.selectButton, selected && styles.selectButtonSelected]}
                >
                  <Text style={[styles.selectButtonText, selected && styles.selectButtonTextSelected]}>
                    {selected ? '선택됨' : '이 카드 선택'}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        {selectedCard && (
          <View style={styles.selectedPreview}>
            <Text style={styles.selectedLabel}>선택한 카드</Text>
            <Image source={{ uri: selectedCard.imageUrl }} style={styles.selectedImage} resizeMode="cover" />
            <Text style={styles.selectedName}>{selectedCard.name}</Text>
          </View>
        )}

        <Pressable style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>완료</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={!!detailCard} transparent animationType="fade" onRequestClose={() => setDetailCard(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {detailCard && (
              <>
                <Text style={styles.modalTitle}>{detailCard.name}</Text>
                <Image
                  source={{ uri: detailCard.imageUrl }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                <Text style={styles.modalBrand}>{detailCard.brand}</Text>
                <Text style={styles.modalSummary}>{detailCard.summary}</Text>
                <Text style={styles.modalDetail}>{detailCard.detail}</Text>

                <View style={styles.modalButtonRow}>
                  <Pressable
                    style={styles.modalSecondaryButton}
                    onPress={() => setDetailCard(null)}
                  >
                    <Text style={styles.modalSecondaryButtonText}>닫기</Text>
                  </Pressable>

                  <Pressable
                    style={styles.modalPrimaryButton}
                    onPress={() => {
                      setSelectedCardId(detailCard.id);
                      setDetailCard(null);
                    }}
                  >
                    <Text style={styles.modalPrimaryButtonText}>이 카드 선택</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subTitle: {
    marginTop: 8,
    marginBottom: 20,
    fontSize: 14,
    color: '#6B7280',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
  cardWrapper: {
    width: '48%',
  },
  cardButton: {
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    padding: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardButtonSelected: {
    borderColor: '#111827',
  },
  cardImage: {
    width: '100%',
    height: 110,
    borderRadius: 12,
  },
  cardName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  selectButton: {
    marginTop: 8,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectButtonSelected: {
    backgroundColor: '#D1D5DB',
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  selectButtonTextSelected: {
    color: '#111827',
  },
  selectedPreview: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  selectedLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedImage: {
    marginTop: 10,
    width: 220,
    height: 140,
    borderRadius: 16,
  },
  selectedName: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  completeButton: {
    marginTop: 24,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  modalImage: {
    width: '100%',
    height: 180,
    marginTop: 16,
  },
  modalBrand: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  modalSummary: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  modalDetail: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalSecondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPrimaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSecondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  modalPrimaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
});