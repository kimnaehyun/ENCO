// src/screens/group/GroupInfoScreen.tsx
import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';;
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';
import {
  getGroupSettings,
  updateGroupSettings,
  getGroupMembers,
  type GroupMember,
} from '../../services/groupService';
import {
  getGroupCards,
  type GroupCardItem,
} from '../../services/paymentService';

const TAGS = ['여행', '스포츠', '문화생활', '경조사', '공과금', '음식'];

const TAG_TYPE_ID_MAP = {
  여행: 1,
  스포츠: 2,
  문화생활: 3,
  경조사: 4,
  공과금: 5,
  음식: 6,
} as const;

type IssuedCardUI = {
  id: string;
  name: string;
  image: { uri: string };
  backImage: { uri: string };
  isBasic: boolean;
};

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center py-4 border-b border-gray-100">
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoRowContent}>{children}</View>
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

  const isAdmin = !!params.isAdmin;
  const groupId = params.groupId;

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isEdit, setIsEdit] = useState(false);

  const [groupName, setGroupName] = useState(params.groupName ?? '모임명');
  const [intro, setIntro] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dues, setDues] = useState<DuesState>({
    cycle: '매월',
    day: '',
    amount: '',
    rate: '',
  });
  const [groundRules, setGroundRules] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [issuedCards, setIssuedCards] = useState<IssuedCardUI[]>([]);
  const [representativeCardId, setRepresentativeCardId] = useState<string>('');

  const representativeCard =
    issuedCards.find(c => c.id === representativeCardId) ?? issuedCards[0];

  useEffect(() => {
    const fetchGroupSettings = async () => {
      if (!groupId) return;
      try {
        console.log('groupId 확인:', groupId);

        const data = await getGroupSettings(groupId);
        console.log('모임 설정 조회 성공:', data);
        console.log('result만 확인:', data.result);

        const result = data.result;

        setGroupName(result.groupName ?? '모임명');
        setIntro(result.introduction ?? '');
        setSelectedTags((result.types ?? []).map(type => type.typeName));
        setGroundRules(result.groundRule ?? '');

        // createdAt 포맷: 'YYYY-MM-DDTHH:...' → 'YYYY.M.D'
        if (result.createdAt) {
          const d = new Date(result.createdAt);
          setCreatedAt(
            `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`
          );
        }

        // GET 응답 필드명이 duePolicy / policy 두 가지일 수 있으므로 방어적으로 읽음
        const rawResult = result as any;
        const policyData = rawResult.duePolicy ?? rawResult.policy;
        if (policyData) {
          setDues(prev => ({
            ...prev,
            day: String(policyData.dayOfMonth ?? ''),
            amount: String(policyData.amount ?? policyData.monthlyFee ?? ''),
            rate: String(policyData.voteCriteria ?? ''),
          }));
        }

        const membersData = await getGroupMembers(groupId);
        console.log('모임원 목록 조회 성공:', membersData);
        console.log('멤버 배열:', membersData.result);
        setMembers(membersData.result);

        const cardsData = await getGroupCards(groupId);
        console.log('모임 카드 목록 조회 성공:', cardsData);
        console.log('카드 배열:', cardsData.result);

        const mappedCards: IssuedCardUI[] = cardsData.result.map((card: GroupCardItem) => ({
          id: String(card.cardId),
          name: card.cardName,
          image: {
            uri: `https://api.ssafywte.site${card.frontCardImageUrl}`,
          },
          backImage: {
            uri: `https://api.ssafywte.site${card.backCardImageUrl}`,
          },
          isBasic: card.isBasic,
        }));

        setIssuedCards(mappedCards);

        const basicCard = mappedCards.find(card => card.isBasic);
        if (basicCard) {
          setRepresentativeCardId(basicCard.id);
        } else if (mappedCards.length > 0) {
          setRepresentativeCardId(mappedCards[0].id);
        }
      } catch (error: any) {
        console.error('조회 실패 전체:', error);
        console.error('error.message:', error?.message);
        console.error('error.response?.status:', error?.response?.status);
        console.error('error.response?.data:', error?.response?.data);
        console.error('error.config?.url:', error?.config?.url);
      }
    };

    fetchGroupSettings();
  }, [groupId]);

  const buildUpdateRequestBody = () => {
    const body = {
      groupName,
      instruction: intro,
      typeIds: selectedTags
        .map(tag => TAG_TYPE_ID_MAP[tag as keyof typeof TAG_TYPE_ID_MAP])
        .filter(Boolean),
      duePolicy: {
        amount: Number(String(dues.amount).replace(/,/g, '')),
        dayOfMonth: Number(dues.day),
        voteCriteria: Number(dues.rate),
      },
      groundRule: groundRules,
    };
    console.log('[GroupInfo] updateGroupSettings requestBody:', JSON.stringify(body, null, 2));
    return body;
  };

  const toggleTag = (tag: string) => {
    if (!isEdit) return;
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
  };

  const onToggleEdit = async () => {
    if (!isAdmin || !groupId) return;

    if (isEdit) {
      try {
        const requestBody = buildUpdateRequestBody();
        const response = await updateGroupSettings(groupId, requestBody);

        console.log('모임 설정 수정 성공:', response);

        Alert.alert('저장', '모임 설정이 저장되었습니다.', [
          { text: '확인', onPress: () => setIsEdit(false) },
        ]);
      } catch (error: any) {
        console.error('모임 설정 수정 실패:', error);
        console.error('error.response?.data:', error?.response?.data);

        Alert.alert(
          '오류',
          error?.response?.data?.message ?? '모임 설정 저장 중 오류가 발생했습니다.',
        );
      }

      return;
    }

    setIsEdit(true);
  };

  return (
    <ScreenLayout>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* 헤더 */}
        <View className="flex-row items-center justify-between mb-5">
          <Text style={styles.headerTitle}>모임 정보</Text>
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
                  <Text style={styles.cancelText}>취소</Text>
                </Pressable>
              )}
              <Pressable onPress={onToggleEdit} hitSlop={12}>
                <Text style={styles.editText}>{isEdit ? '저장' : '수정'}</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* 기본 정보 카드 */}
        <View className="bg-white rounded-3xl px-6 mb-4" style={styles.card}>
          {/* 모임명 */}
          <InfoRow label="모임명">
            <Text style={styles.groupNameText}>{groupName}</Text>
          </InfoRow>

          {/* 모임소개 */}
          <InfoRow label="모임소개">
            {isEdit ? (
              <TextInput
                value={intro}
                onChangeText={setIntro}
                style={styles.introText}
              />
            ) : (
              <Text style={styles.introText}>{intro || '-'}</Text>
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
                      style={[
                        styles.tagButtonEdit,
                        selectedTags.includes(tag) && styles.tagButtonEditActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          selectedTags.includes(tag) && styles.tagTextActive,
                        ]}
                      >
                        {tag}
                      </Text>
                    </Pressable>
                  ))
                : selectedTags.map(tag => (
                    <View
                      key={tag}
                      className="rounded-2xl px-3 py-1"
                      style={styles.tagInactive}
                    >
                      <Text style={styles.tagTextInactive}>{tag}</Text>
                    </View>
                  ))}
            </View>
          </InfoRow>

          {/* 모임 개설일 */}
          <InfoRow label="모임 개설일">
            <Text style={styles.infoValueText}>{createdAt || '-'}</Text>
          </InfoRow>

          {/* 회비 */}
          <View className="py-4">
            <View className="flex-row items-center mb-3">
              <Text style={styles.infoLabel}>회비</Text>
              <Text style={styles.duesValue}>
                {isEdit
                  ? `매월 / ${dues.day}일 / ${dues.amount}원`
                  : `매월 / ${dues.day}일 / ${dues.amount}원 / ${dues.rate}%`}
              </Text>
            </View>

            {isEdit && (
              <View style={styles.duesEditContainer}>
                {/* 매월 + 일 */}
                <View style={styles.inputRow}>
                  <Text style={styles.unitText}>매월</Text>
                  <View style={styles.inputPill}>
                    <TextInput
                      value={dues.day}
                      onChangeText={v =>
                        setDues(prev => ({
                          ...prev,
                          day: v.replace(/[^0-9]/g, ''),
                        }))
                      }
                      keyboardType="numeric"
                      style={styles.pillInput}
                    />
                  </View>
                  <Text style={styles.unitText}>일</Text>
                </View>

                {/* 금액 + 원 */}
                <View style={styles.inputRow}>
                  <View style={styles.inputPillWide}>
                    <TextInput
                      value={dues.amount}
                      onChangeText={v =>
                        setDues(prev => ({
                          ...prev,
                          amount: v.replace(/[^0-9,]/g, ''),
                        }))
                      }
                      keyboardType="numeric"
                      style={styles.pillInputCompact}
                    />
                  </View>
                  <Text style={styles.unitText}>원</Text>
                </View>

                {/* 투표 기준 + % */}
                <View style={styles.inputRowLast}>
                  <Text style={styles.unitText}>투표 기준</Text>
                  <View style={styles.inputPill}>
                    <TextInput
                      value={dues.rate}
                      onChangeText={v =>
                        setDues(prev => ({
                          ...prev,
                          rate: v.replace(/[^0-9]/g, ''),
                        }))
                      }
                      keyboardType="numeric"
                      style={styles.pillInputCompact}
                    />
                  </View>
                  <Text style={styles.unitText}>%</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* 그라운드룰 카드 */}
        <View className="bg-white rounded-3xl px-6 py-5 mb-4" style={styles.card}>
          <Text style={styles.sectionTitle}>그라운드룰</Text>
          {isEdit ? (
            <TextInput
              value={groundRules}
              onChangeText={setGroundRules}
              multiline
              style={styles.groundRulesInput}
            />
          ) : (
            <Text style={styles.groundRulesText}>{groundRules || '-'}</Text>
          )}
        </View>

        {/* 발급 카드 */}
        <View className="bg-white rounded-3xl px-6 py-5" style={styles.card}>
          <View className="flex-row items-center justify-between mb-4">
            <Text style={styles.cardSectionTitle}>
              {isEdit ? '발급 카드 목록' : '대표 카드'}
            </Text>
            {isEdit && (
              <Text style={styles.cardHintText}>대표 카드를 선택하세요</Text>
            )}
          </View>

          {isEdit ? (
            issuedCards.length === 0 ? (
              <Text style={styles.groundRulesText}>발급된 카드가 없습니다.</Text>
            ) : (
              <View style={styles.cardListContainer}>
                {issuedCards.map(card => {
                  const isRep = card.id === representativeCardId;
                  return (
                    <Pressable
                      key={card.id}
                      onPress={() => setRepresentativeCardId(card.id)}
                      style={[
                        styles.cardItem,
                        isRep && styles.cardItemSelected,
                      ]}
                    >
                      <View style={styles.cardImageRow}>
                        <Image
                          source={card.image}
                          style={styles.cardImageHalf}
                          resizeMode="contain"
                        />
                        <Image
                          source={card.backImage}
                          style={styles.cardImageHalf}
                          resizeMode="contain"
                        />
                      </View>
                      {isRep && (
                        <View style={styles.repBadge}>
                          <Text style={styles.repBadgeText}>대표 카드 ✓</Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )
          ) : (
            representativeCard ? (
              <View style={styles.cardImageRow}>
                <Image
                  source={representativeCard.image}
                  style={styles.repCardImageHalf}
                  resizeMode="contain"
                />
                <Image
                  source={representativeCard.backImage}
                  style={styles.repCardImageHalf}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <Text style={styles.groundRulesText}>발급된 카드가 없습니다.</Text>
            )
          )}
        </View>

        {/* 모임원 목록 테스트 */}
        <View className="bg-white rounded-3xl px-6 py-5 mt-4" style={styles.card}>
          <Text style={styles.sectionTitle}>모임원 목록</Text>

          {members.length === 0 ? (
            <Text style={styles.groundRulesText}>모임원이 없습니다.</Text>
          ) : (
            members.map(member => (
              <View
                key={member.userId}
                className="flex-row items-center justify-between py-3 border-b border-gray-100"
              >
                <Text style={styles.infoValueText}>
                  {member.name ?? `유저 ${member.userId}`}
                </Text>
                <Text style={styles.cancelText}>{member.role}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}


const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 32 },
  infoRowContent: { flex: 1 },
  duesEditContainer: { gap: 8, paddingLeft: 80 },
  cardListContainer: { gap: 12 },
  tagButtonEdit: { backgroundColor: '#F3F4F6' },
  tagButtonEditActive: { backgroundColor: '#1428A0' },
  tagTextActive: { color: COLORS.white },
  cardItemSelected: { borderColor: '#1428A0' },

  // 헤더
  headerTitle: { fontSize: 20, fontFamily: FONT_FAMILY.bold, color: COLORS.dark },
  cancelText: { fontSize: 14, color: COLORS.muted, fontFamily: FONT_FAMILY.medium },
  editText: { fontSize: 14, color: COLORS.brand, fontFamily: FONT_FAMILY.medium },

  // 공통 카드 그림자
  card: { shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },

  // InfoRow
  infoLabel: { width: 80, fontSize: 14, color: COLORS.muted, fontFamily: FONT_FAMILY.medium },
  groupNameText: { fontSize: 18, fontFamily: FONT_FAMILY.bold, color: COLORS.dark, textAlign: 'right' },
  introText: { fontSize: 14, color: COLORS.dark, fontFamily: FONT_FAMILY.medium, textAlign: 'right' },
  infoValueText: { fontSize: 14, color: COLORS.dark, fontFamily: FONT_FAMILY.medium, textAlign: 'right' },

  // 태그
  tagText: { fontSize: 13, fontFamily: FONT_FAMILY.medium },
  tagInactive: { backgroundColor: '#F3F4F6' },
  tagTextInactive: { fontSize: 13, color: COLORS.subtle, fontFamily: FONT_FAMILY.medium },

  // 회비
  duesValue: { flex: 1, fontSize: 13, color: COLORS.dark, fontFamily: FONT_FAMILY.medium, textAlign: 'right' },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginBottom: 10 },
  inputRowLast: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  inputPill: { backgroundColor: '#E5E7EB', borderRadius: 50, paddingHorizontal: 20, height: 32, justifyContent: 'center', alignItems: 'center', minWidth: 80 },
  inputPillWide: { backgroundColor: '#E5E7EB', borderRadius: 50, paddingHorizontal: 20, height: 32, justifyContent: 'center', alignItems: 'center', minWidth: 120 },
  pillInput: { fontSize: 16, color: COLORS.brand, fontFamily: FONT_FAMILY.medium, textAlign: 'center', paddingVertical: 0, includeFontPadding: false },
  pillInputCompact: { fontSize: 16, color: COLORS.brand, fontFamily: FONT_FAMILY.medium, textAlign: 'center', padding: 0 },
  unitText: { fontSize: 13, color: '#000', fontFamily: FONT_FAMILY.medium },

  // 그라운드룰
  sectionTitle: { fontSize: 15, fontFamily: FONT_FAMILY.bold, color: COLORS.dark, marginBottom: 12 },
  groundRulesInput: { fontSize: 14, color: COLORS.dark, fontFamily: FONT_FAMILY.medium, lineHeight: 22, textAlignVertical: 'top', minHeight: 100, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12 },
  groundRulesText: { fontSize: 14, color: COLORS.subtle, fontFamily: FONT_FAMILY.medium, lineHeight: 24 },

  // 카드 섹션
  cardSectionTitle: { fontSize: 15, fontFamily: FONT_FAMILY.bold, color: COLORS.dark },
  cardHintText: { fontSize: 12, color: COLORS.brand, fontFamily: FONT_FAMILY.medium },
  cardItem: { borderRadius: 16, borderWidth: 2, overflow: 'hidden', padding: 8, backgroundColor: '#F9FAFB' },
  cardImageRow: { flexDirection: 'row', gap: 8 },
  cardImageHalf: { flex: 1, aspectRatio: 0.63, borderRadius: 12 },
  repBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#1428A0', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  repBadgeText: { fontSize: 11, color: COLORS.white, fontFamily: FONT_FAMILY.medium },
  repCardImageHalf: { flex: 1, aspectRatio: 0.63, borderRadius: 16 },
});