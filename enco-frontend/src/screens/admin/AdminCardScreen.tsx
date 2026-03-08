// src/screens/admin/AdminCardScreen.tsx
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';
import { AdminCard, AdminStep } from '../../types/admin';

const PIN_LEN = 6;

export default function AdminCardScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;

  const groupName = params.groupName ?? '모임명';

  // ✅ 자동 입력(임시): 총무 정보/주소
  const treasurer = useMemo(
    () => ({
      name: '김총무(임시 자동 입력)',
      phone: '010-1234-5678',
      address: '서울시 강남구 어딘가 123(임시 자동 입력)',
    }),
    []
  );

  // ✅ 모임 성향 옵션 태그(와이어프레임)
  const tasteOptions = useMemo(() => ['여행', '스포츠', '문화생활', '경조사', '공과금', '음식'], []);

  // ✅ 카드 데이터(임시)
  const cards: AdminCard[] = useMemo(
    () => [
      {
        id: 'c1',
        name: 'Dining Plus 카드',
        short: '외식/배달 10% 캐시백(임시)',
        recommendedFor: ['음식'],
        benefits: [
          '외식 가맹점 10% 캐시백(월 최대 2만원, 임시)',
          '배달앱 5% 캐시백(임시)',
          '커피/디저트 3% 캐시백(임시)',
        ],
      },
      {
        id: 'c2',
        name: 'Travel Saver 카드',
        short: '여행/항공/숙박 할인(임시)',
        recommendedFor: ['여행', '문화생활'],
        benefits: [
          '항공/숙박 7% 할인(임시)',
          '해외 결제 수수료 우대(임시)',
          '공항 라운지 연 2회(임시)',
        ],
      },
      {
        id: 'c3',
        name: 'Sports Fan 카드',
        short: '스포츠/레저 할인(임시)',
        recommendedFor: ['스포츠', '문화생활'],
        benefits: [
          '스포츠센터/레저 5% 할인(임시)',
          '영화/공연 3% 할인(임시)',
          '교통 3% 캐시백(임시)',
        ],
      },
      {
        id: 'c4',
        name: 'Life Compact 카드',
        short: '생활형(통신/마트/공과금) 캐시백(임시)',
        recommendedFor: ['공과금', '경조사'],
        benefits: [
          '마트 3% 캐시백(임시)',
          '통신 5% 캐시백(임시)',
          '공과금 자동이체 5% 캐시백(임시)',
        ],
      },
      {
        id: 'c5',
        name: 'Ceremony Care 카드',
        short: '경조사/선물/꽃배달 할인(임시)',
        recommendedFor: ['경조사'],
        benefits: [
          '꽃배달 7% 할인(임시)',
          '선물/상품권 3% 할인(임시)',
          '택배 2% 할인(임시)',
        ],
      },
    ],
    []
  );

  // ===== step/state =====
  const [step, setStep] = useState<AdminStep>('main');

  // ✅ 다중 선택 태그
  const [selectedTastes, setSelectedTastes] = useState<string[]>(['음식']); // 임시 기본값
  const [didRecommend, setDidRecommend] = useState(false);

  const [selectedCard, setSelectedCard] = useState<AdminCard | null>(null);

  // PIN
  const [pin, setPin] = useState('');

  // ===== 추천/필터 =====
  const filteredCards = useMemo(() => {
    if (selectedTastes.length === 0) return [];
    return cards.filter(c => c.recommendedFor.some(tag => selectedTastes.includes(tag)));
  }, [cards, selectedTastes]);

  const recommended = useMemo(() => {
    // 추천받기 누르기 전에는 숨김
    if (!didRecommend) return [];
    if (filteredCards.length >= 2) return filteredCards.slice(0, 2);
    const rest = cards.filter(c => !filteredCards.includes(c));
    return [...filteredCards, ...rest].slice(0, 2);
  }, [cards, filteredCards, didRecommend]);

  // ===== navigation within screen =====
  const goBackStep = () => {
    if (step === 'main') {
      navigation.goBack();
      return;
    }
    if (step === 'list') setStep('main');
    else if (step === 'detail') setStep('list');
    else if (step === 'pin') {
      setPin('');
      setStep('detail');
    } else if (step === 'done') {
      setPin('');
      setSelectedCard(null);
      setStep('main');
    }
  };

  const openCardList = () => setStep('list');

  const openCardDetail = (card: AdminCard) => {
    setSelectedCard(card);
    setStep('detail');
  };

  const applyCard = () => {
    if (!selectedCard) return;
    setPin('');
    setStep('pin');
  };

  const appendPin = (d: string) => {
    if (pin.length >= PIN_LEN) return;
    const next = pin + d;
    setPin(next);
    if (next.length === PIN_LEN) {
      setTimeout(() => setStep('done'), 250);
    }
  };

  const backspacePin = () => setPin(prev => prev.slice(0, -1));

  const Header = ({ title }: { title: string }) => (
    <View style={styles.headerBar}>
      <Text numberOfLines={1} style={styles.headerTitle}>
        {title}
      </Text>
      <Pressable onPress={goBackStep} hitSlop={12}>
        <Text style={styles.headerBtnText}>{step === 'main' ? '닫기' : '뒤로'}</Text>
      </Pressable>
    </View>
  );

  // ====== step views ======
  if (step === 'list') {
    return (
      <ScreenLayout>
        <Header title="카드 목록" />

        <View style={{ marginTop: 12 }}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>
              선택된 성향: {selectedTastes.length ? selectedTastes.join(', ') : '(없음)'}
            </Text>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            {(selectedTastes.length === 0 || filteredCards.length === 0) ? (
              <View style={[styles.cardBox, { marginTop: 14 }]}>
                <Text style={{ fontWeight: '900' }}>추천 카드가 없습니다(임시)</Text>
                <Text style={{ marginTop: 8, color: '#6B7280' }}>성향을 선택/변경해보세요.</Text>
              </View>
            ) : (
              filteredCards.map(c => (
                <Pressable
                  key={c.id}
                  onPress={() => openCardDetail(c)}
                  style={[styles.cardBox, { marginTop: 14 }]}
                  hitSlop={10}
                >
                  <Text style={{ fontSize: 16, fontWeight: '900' }}>{c.name}</Text>
                  <Text style={{ marginTop: 6, color: '#374151' }}>{c.short}</Text>
                  <Text style={{ marginTop: 8, color: '#6B7280' }}>눌러서 혜택 보기</Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      </ScreenLayout>
    );
  }

  if (step === 'detail') {
    const c = selectedCard;
    return (
      <ScreenLayout>
        <Header title="카드 혜택 정보" />

        {!c ? (
          <View style={{ marginTop: 16 }}>
            <Text>선택된 카드가 없습니다.</Text>
          </View>
        ) : (
          <View style={{ marginTop: 14 }}>
            <View style={styles.cardBox}>
              <Text style={{ fontSize: 18, fontWeight: '900' }}>{c.name}</Text>
              <Text style={{ marginTop: 8, color: '#374151' }}>{c.short}</Text>

              <Text style={{ marginTop: 14, fontWeight: '900' }}>혜택(임시)</Text>
              <View style={{ marginTop: 8, gap: 6 }}>
                {c.benefits.map((b, idx) => (
                  <Text key={idx} style={{ color: '#111827' }}>
                    • {b}
                  </Text>
                ))}
              </View>
            </View>

            <Pressable onPress={applyCard} style={styles.primaryBtn} hitSlop={10}>
              <Text style={styles.primaryBtnText}>발급 신청하기</Text>
            </Pressable>
          </View>
        )}
      </ScreenLayout>
    );
  }

  if (step === 'pin') {
    return (
      <ScreenLayout>
        <Header title="비밀번호 입력" />

        <View style={{ marginTop: 28, alignItems: 'center' }}>
          <Text style={{ fontSize: 22, fontWeight: '900' }}>비밀번호를 입력해주세요</Text>

          <View style={styles.pinDotsRow}>
            {Array.from({ length: PIN_LEN }).map((_, i) => (
              <View key={i} style={[styles.pinDot, i < pin.length && styles.pinDotFilled]} />
            ))}
          </View>

          <View style={styles.keypad}>
            {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map(k => {
              const isBack = k === '⌫';
              const isDot = k === '.';
              return (
                <Pressable
                  key={k}
                  onPress={() => {
                    if (isBack) backspacePin();
                    else if (isDot) return;
                    else appendPin(k);
                  }}
                  style={styles.keyBtn}
                >
                  <Text style={styles.keyText}>{k}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={{ marginTop: 14, color: '#6B7280', textAlign: 'center' }}>
            (임시) 6자리 입력 시 발급 완료로 이동
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  if (step === 'done') {
    return (
      <ScreenLayout>
        <Header title="발급 완료" />
        <View style={{ marginTop: 70, alignItems: 'center' }}>
          <Text style={{ fontSize: 22, fontWeight: '900' }}>발급 완료되었습니다</Text>
          <Text style={{ marginTop: 10, color: '#6B7280' }}>{selectedCard?.name ?? ''} (임시)</Text>

          <Pressable
            onPress={() => {
              Alert.alert('완료', '카드 발급 완료(임시).');
              setPin('');
              setSelectedCard(null);
              setDidRecommend(false);
              setStep('main');
            }}
            style={[styles.primaryBtn, { width: 220 }]}
            hitSlop={10}
          >
            <Text style={styles.primaryBtnText}>확인</Text>
          </Pressable>
        </View>
      </ScreenLayout>
    );
  }

  // ===== step === 'main' =====
  return (
    <ScreenLayout>
      <Header title="카드 추가 발급" />

      <ScrollView style={{ marginTop: 12 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* 총무 정보 자동 입력 */}
        <View style={styles.box}>
          <Text style={styles.boxTitle}>총무 정보(자동 입력)</Text>
          <Text style={styles.boxLine}>이름: {treasurer.name}</Text>
          <Text style={styles.boxLine}>연락처: {treasurer.phone}</Text>
          <Text style={styles.boxLine}>주소: {treasurer.address}</Text>
        </View>

        {/* 모임 성향(옵션 태그) - 중복 선택 */}
        <View style={styles.box}>
          <Text style={styles.boxTitle}>모임 성향(옵션 태그)</Text>
          <Text style={{ marginTop: 8, color: '#111827', fontWeight: '700' }}>
            선택됨: {selectedTastes.length ? selectedTastes.join(', ') : '(없음)'}
          </Text>
          <Text style={{ marginTop: 6, color: '#6B7280' }}>중복 선택 가능</Text>

          <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {tasteOptions.map(tag => {
              const active = selectedTastes.includes(tag);
              return (
                <Pressable
                  key={tag}
                  onPress={() => {
                    setSelectedTastes(prev =>
                      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                    );
                    setDidRecommend(false); // 태그 바꾸면 다시 추천받기 필요
                  }}
                  style={[styles.tagBtn, active && styles.tagBtnActive]}
                  hitSlop={10}
                >
                  <Text style={[styles.tagText, active && styles.tagTextActive]}>{tag}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => {
              if (selectedTastes.length === 0) {
                Alert.alert('확인', '모임 성향을 1개 이상 선택해주세요.');
                return;
              }
              setDidRecommend(true);
            }}
            style={styles.recommendBtn}
            hitSlop={10}
          >
            <Text style={{ fontWeight: '900' }}>카드 추천받기</Text>
          </Pressable>
        </View>

        {/* 추천 카드 */}
        <View style={styles.box}>
          <Text style={styles.boxTitle}>추천 카드</Text>

          {!didRecommend ? (
            <Text style={{ marginTop: 10, color: '#6B7280' }}>
              위에서 모임 성향을 선택하고 “카드 추천받기”를 눌러주세요.
            </Text>
          ) : (
            <>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
                {recommended.map(c => (
                  <Pressable
                    key={c.id}
                    onPress={() => openCardDetail(c)}
                    style={styles.miniCard}
                    hitSlop={10}
                  >
                    <View style={styles.miniCardImg} />
                    <Text numberOfLines={1} style={{ fontWeight: '900', marginTop: 10 }}>
                      {c.name}
                    </Text>
                    <Text numberOfLines={2} style={{ marginTop: 6, color: '#374151', fontSize: 12 }}>
                      {c.short}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable onPress={openCardList} style={styles.moreBtn} hitSlop={10}>
                <Text style={{ fontWeight: '900' }}>더보기</Text>
              </Pressable>
            </>
          )}
        </View>

        <Text style={{ marginTop: 10, textAlign: 'center', color: '#6B7280' }}>
          {groupName} / {params.groupId ?? 'groupId 없음'}
        </Text>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 18, fontWeight: '900', flex: 1, paddingRight: 12 },
  headerBtnText: { fontSize: 16, fontWeight: '900' },

  pill: {
    backgroundColor: '#D9D9D9',
    borderRadius: 26,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  pillText: { fontSize: 14, fontWeight: '900' },

  box: {
    backgroundColor: '#D9D9D9',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 14,
  },
  boxTitle: { fontSize: 16, fontWeight: '900' },
  boxLine: { marginTop: 8, color: '#111827', fontWeight: '700' },

  cardBox: {
    backgroundColor: '#D9D9D9',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  tagBtn: {
    width: '30%',
    height: 54,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagBtnActive: { backgroundColor: '#BDBDBD' },
  tagText: { fontWeight: '900', color: '#111827' },
  tagTextActive: { color: '#111827' },

  recommendBtn: {
    marginTop: 14,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  miniCard: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 18,
    padding: 12,
    minHeight: 170,
  },
  miniCardImg: { height: 80, borderRadius: 14, backgroundColor: '#BDBDBD' },

  moreBtn: {
    marginTop: 12,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryBtn: {
    marginTop: 16,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  primaryBtnText: { fontSize: 16, fontWeight: '900' },

  pinDotsRow: { flexDirection: 'row', gap: 10, marginTop: 22 },
  pinDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#D1D5DB' },
  pinDotFilled: { backgroundColor: '#6B7280' },

  keypad: {
    marginTop: 26,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  keyBtn: {
    width: '30%',
    height: 54,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { fontSize: 18, fontWeight: '800' },
});
