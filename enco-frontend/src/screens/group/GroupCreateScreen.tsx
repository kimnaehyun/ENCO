import React, { useMemo, useState, useEffect } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';;
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <Text style={styles.pageTitle}>모임통장 개설하기</Text>

        {/* 총무 정보 */}
        <Text style={styles.sectionLabel}>총무 정보(자동 입력)</Text>
        <View style={styles.managerCard}>
          {[
            { label: '이름', value: manager.name },
            { label: '이메일', value: manager.email },
            { label: '전화번호', value: manager.phone },
          ].map((item, i) => (
            <View
              key={item.label}
              style={[styles.managerRow, i < 2 && styles.managerRowBorder]}
            >
              <Text style={styles.managerLabel}>{item.label}</Text>
              <Text style={styles.managerValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* 모임명 */}
        <Text style={styles.sectionLabel}>모임명</Text>
        <TextInput
          value={groupName}
          onChangeText={setGroupName}
          placeholder="모임명을 입력해주세요"
          placeholderTextColor="#9CA3AF"
          style={styles.groupNameInput}
        />

        {/* 모임 성향 태그 */}
        <Text style={styles.sectionLabel}>모임 성향(옵션 태그)</Text>

        {tagLoading ? (
          <ActivityIndicator
            size="small"
            color="#1428A0"
            style={styles.tagLoader}
          />
        ) : (
          <View style={styles.tagGrid}>
            {tagOptions.map((tag) => {
              const selected = selectedTags.includes(tag.typeName);
              return (
                <Pressable
                  key={tag.typeId}
                  onPress={() => toggleTag(tag.typeName)}
                  style={[styles.tagButton, selected && styles.tagButtonSelected]}
                >
                  <Text style={styles.tagButtonText}>{tag.typeName}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Text style={styles.tagHint}>중복 선택 가능</Text>

        {/* 선택된 카드 프리뷰 */}
        {selectedCardImage && (
          <View style={styles.selectedCardPreview}>
            <Text style={styles.selectedCardLabel}>선택한 카드</Text>
            <Image
              source={{ uri: selectedCardImage }}
              style={styles.selectedCardImage}
              resizeMode="contain"
            />
            <Text style={styles.selectedCardName}>{selectedCardName}</Text>
          </View>
        )}

        {/* 버튼 */}
        <View style={styles.buttonGroup}>
          <View style={styles.buttonRow}>
            <Pressable
              onPress={() => {
                setRecommendPressed(true);
                handleRecommend();
              }}
              style={[styles.halfButton, recommendPressed && styles.halfButtonPressed]}
            >
              <Text style={styles.halfButtonText}>카드 추천 받기</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setViewAllPressed(true);
                handleViewAll();
              }}
              style={[styles.halfButton, viewAllPressed && styles.halfButtonPressed]}
            >
              <Text style={styles.halfButtonText}>전체 카드 보기</Text>
            </Pressable>
          </View>

          {/* 개설하기 - 카드 선택 후에만 표시 */}
          {selectedCardId && (
            <Pressable onPress={handleSubmit} style={styles.submitButton}>
              <Text style={styles.submitButtonText}>모임통장 개설하기</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },

  // ── 헤더 ──────────────────────────────────
  pageTitle: {
    fontSize: 22,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 28,
  },

  // ── 섹션 레이블 ───────────────────────────
  sectionLabel: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    marginBottom: 8,
  },

  // ── 총무 정보 카드 ────────────────────────
  managerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  managerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  managerRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  managerLabel: {
    fontSize: 14,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
  },
  managerValue: {
    fontSize: 14,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.medium,
  },

  // ── 모임명 입력 ───────────────────────────
  groupNameInput: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    fontSize: 15,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.medium,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  // ── 태그 그리드 ───────────────────────────
  tagLoader: {
    marginVertical: 24,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
  },
  tagButton: {
    width: '31%',
    paddingVertical: 18,
    borderRadius: 18,
    backgroundColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tagButtonSelected: {
    backgroundColor: '#1428A0',
    shadowColor: '#1428A0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  tagButtonText: {
    fontSize: 15,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },
  tagHint: {
    fontSize: 12,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
    textAlign: 'center',
    marginBottom: 28,
  },

  // ── 선택된 카드 프리뷰 ────────────────────
  selectedCardPreview: {
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
  },
  selectedCardLabel: {
    fontSize: 13,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
    marginBottom: 12,
  },
  selectedCardImage: {
    width: '60%',
    aspectRatio: 2,
    borderRadius: 12,
  },
  selectedCardName: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },

  // ── 버튼 그룹 ─────────────────────────────
  buttonGroup: {
    gap: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfButton: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#1428A0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  halfButtonPressed: {
    backgroundColor: '#C7D2FE',
  },
  halfButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONT_FAMILY.bold,
  },
  submitButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#1428A0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
  },
});
