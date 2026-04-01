// src/screens/admin/AdminCardScreen.tsx
// 카드 추가 발급 — API 연동, PIN 제거, card-add 직접 호출
import React, { useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import Text from '@/components/typography';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';
import { getMyGroups } from '../../services/groupService';
import { cardAdd } from '../../services/paymentService';
import { useAuthStore } from '../../store/useAuthStore';
import { GroupStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from 'node_modules/@react-navigation/native-stack/lib/typescript/src/types';

const TAG_OPTIONS = ['여행', '스포츠', '문화생활', '경조사', '공과금', '음식'];

type AdminCardRouteProp = RouteProp<GroupStackParamList, 'AdminCard'>;
type AdminCardNavigationProp = NativeStackNavigationProp<
  GroupStackParamList,
  'AdminCard'
>;

export default function AdminCardScreen() {
  const navigation = useNavigation<AdminCardNavigationProp>();
  const route = useRoute<AdminCardRouteProp>();
  const params = route.params ?? {};

  const groupName = params.groupName ?? '모임명';
  const groupId = params.groupId;

  // 총무 정보 (store에서 가져오기)
  const user = useAuthStore(s => s.user);
  const profile = useAuthStore(s => s.profile);

  const treasurer = useMemo(
    () => ({
      name: profile?.name ?? user ?? '',
      email: profile?.email ?? '',
      phone: profile?.phoneNumber ?? '',
    }),
    [profile, user],
  );

  // accountId: params로 받거나 API에서 조회
  const [accountId, setAccountId] = useState<number | null>(
    params.accountId ?? null,
  );
  const [accountLoading, setAccountLoading] = useState(!params.accountId);

  useEffect(() => {
    if (accountId) return;
    const fetchAccountId = async () => {
      try {
        const res = await getMyGroups();
        const group = res.result.find(
          g => String(g.groupId) === String(groupId),
        );
        if (group) {
          setAccountId(group.account.accountId);
          console.log(
            '[AdminCard] accountId 조회 성공:',
            group.account.accountId,
          );
        } else {
          console.warn(
            '[AdminCard] 해당 groupId에 대한 모임을 찾을 수 없음:',
            groupId,
          );
        }
      } catch (err) {
        console.warn('[AdminCard] accountId 조회 실패:', err);
      } finally {
        setAccountLoading(false);
      }
    };
    fetchAccountId();
  }, [groupId, accountId]);

  // 상태 관리
  const [selectedTags, setSelectedTags] = useState<string[]>(
    params.selectedTags ?? [],
  );
  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    params.selectedCardId ?? null,
  );
  const [selectedCardImage, setSelectedCardImage] = useState<string | null>(
    params.selectedCardImage ?? null,
  );
  const [selectedCardName, setSelectedCardName] = useState<string | null>(
    params.selectedCardName ?? null,
  );
  const [recommendPressed, setRecommendPressed] = useState(
    params.recommendPressed ?? false,
  );
  const [viewAllPressed, setViewAllPressed] = useState(
    params.viewAllPressed ?? false,
  );
  const [submitting, setSubmitting] = useState(false);

  // 카드 선택 후 돌아왔을 때 params 동기화
  useEffect(() => {
    if (route.params?.selectedCardId) {
      setSelectedCardId(route.params.selectedCardId);
      setSelectedCardImage(route.params.selectedCardImage ?? null);
      setSelectedCardName(route.params.selectedCardName ?? null);
      setRecommendPressed(route.params.recommendPressed ?? false);
      setViewAllPressed(route.params.viewAllPressed ?? false);
    }
    if (route.params?.selectedTags) {
      setSelectedTags(route.params.selectedTags);
    }
    if (route.params?.accountId) {
      setAccountId(route.params.accountId);
    }
  }, [
    route.params?.selectedCardId,
    route.params?.selectedCardImage,
    route.params?.selectedCardName,
    route.params?.recommendPressed,
    route.params?.viewAllPressed,
    route.params?.selectedTags,
    route.params?.accountId,
  ]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
  };

  const handleRecommend = () => {
    if (selectedTags.length === 0) {
      Alert.alert('안내', '모임 성향을 1개 이상 선택해주세요.');
      return;
    }
    navigation.navigate('AdminCardRecommend', {
      groupId,
      groupName,
      accountId: accountId ?? undefined, // null → undefined
      tags: selectedTags,
      prevTags: selectedTags,
      prevRecommendPressed: true,
      prevViewAllPressed: viewAllPressed,
    });
  };

  const handleViewAll = () => {
    navigation.navigate('AdminCardRecommend', {
      groupId,
      groupName,
      accountId: accountId ?? undefined, // null → undefined
      tags: [],
      prevTags: selectedTags,
      prevRecommendPressed: recommendPressed,
      prevViewAllPressed: true,
    });
  };

  // 카드 발급 신청 — PIN 없이 바로 card-add API 호출
  const handleSubmit = async () => {
    if (!selectedCardId) {
      Alert.alert('안내', '카드를 선택해주세요.');
      return;
    }
    if (!accountId) {
      Alert.alert(
        '오류',
        '모임 계좌 정보를 불러오지 못했습니다. 다시 시도해주세요.',
      );
      return;
    }

    const cardProductId = Number(selectedCardId);
    if (isNaN(cardProductId)) {
      Alert.alert('오류', '카드 정보가 올바르지 않습니다.');
      return;
    }

    setSubmitting(true);
    try {
      console.log('[AdminCard] card-add 요청:', { accountId, cardProductId });
      const res = await cardAdd({ accountId, cardProductId });
      console.log('[AdminCard] card-add 응답:', JSON.stringify(res, null, 2));

      navigation.navigate('AdminCardDone', {
        groupId,
        groupName,
        cardId: res.result.cardId,
        cardNumber: res.result.cardNumber,
        frontImageUrl: res.result.frontImageUrl,
      });
    } catch (err: unknown) {
      console.error(
        '[AdminCard] card-add 실패:',
        (err as { response?: { data?: unknown } })?.response?.data ?? err,
      );
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? '카드 발급에 실패했습니다. 다시 시도해주세요.';
      Alert.alert('발급 실패', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout>
      <ScrollView
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <Text variant="h2" color="dark" className="mb-1.5">
          카드 추가 발급
        </Text>
        <Text variant="caption" color="placeholder" className="mb-7">
          {groupName}
        </Text>

        {/* 총무 정보(자동 입력) */}
        <Text variant="bodySm" color="muted" className="mb-2">
          총무 정보(자동 입력)
        </Text>
        <View
          className="bg-white rouded-[20px] px-[18px] mb-5 "
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          {[
            { label: '이름', value: treasurer.name },
            { label: '이메일', value: treasurer.email },
            { label: '전화번호', value: treasurer.phone },
          ].map((item, i) => (
            <View
              key={item.label}
              className="flex-row justify-between items-center py-3.5"
              style={{
                borderBottomWidth: i < 2 ? 1 : 0,
                borderBottomColor: '#F3F4F6',
              }}
            >
              <Text variant="bodySm" color="placeholder">
                {item.label}
              </Text>
              <Text variant="bodySm" color="dark">
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* 모임 성향 태그 */}
        <Text variant="bodySm" color="muted" className="mb-3">
          모임 성향(옵션 태그)
        </Text>
        <View className="flex-row flex-wrap mb-1.5 gap-[10px]">
          {TAG_OPTIONS.map(tag => {
            const selected = selectedTags.includes(tag);
            return (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                className="rouded-[18px] py-[18px] w-[30%] justify-center items-center"
                style={{
                  backgroundColor: selected ? '#1428A0' : '#C7D2FE',
                  shadowColor: selected ? '#1428A0' : '#000',
                  shadowOffset: { width: 0, height: selected ? 4 : 1 },
                  shadowOpacity: selected ? 0.25 : 0.05,
                  shadowRadius: selected ? 8 : 4,
                  elevation: selected ? 4 : 1,
                }}
              >
                <Text variant="bodyMd" weight="bold" color="white">
                  {tag}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text
          variant="tiny"
          color="placeholder"
          align="center"
          className="mb-7"
        >
          중복 선택 가능
        </Text>

        {/* 선택된 카드 프리뷰 */}
        {selectedCardImage && (
          <View
            className="bg-white rounded-[20px] p-[18px] items-center mb-5 "
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <Text variant="caption" color="placeholder" className="mb-3">
              선택한 카드
            </Text>
            <Image
              source={{ uri: selectedCardImage }}
              className="w-[60%] rounded-xl aspect-[2/1]"
              resizeMode="contain"
            />
            <Text
              variant="bodySm"
              weight="bold"
              color="dark"
              className="mt-[10px]"
            >
              {selectedCardName}
            </Text>
          </View>
        )}

        {/* accountId 로딩 표시 */}
        {accountLoading && (
          <View className="items-center mb-4">
            <ActivityIndicator size="small" color="#1428A0" />
            <Text variant="caption" color="placeholder" className="mt-[6px]">
              계좌 정보 확인 중...
            </Text>
          </View>
        )}

        {/* 버튼 */}
        <View className="gap-[10px]">
          <View className="flex-row gap-[10px] ">
            <Pressable
              onPress={() => {
                setRecommendPressed(true);
                handleRecommend();
              }}
              className="flex-1 h-[54px] rounded-2xl justify-center items-center"
              style={{
                backgroundColor: recommendPressed ? '#C7D2FE' : '#1428A0',
              }}
            >
              <Text variant="bodySm" weight="bold" color="white">
                카드 추천 받기
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setViewAllPressed(true);
                handleViewAll();
              }}
              className="flex-1 h-[54px] rounded-2xl justify-center items-center"
              style={{
                backgroundColor: viewAllPressed ? '#C7D2FE' : '#1428A0',
              }}
            >
              <Text variant="bodySm" weight="bold" color="white">
                전체 카드 보기
              </Text>
            </Pressable>
          </View>

          {/* 발급 신청 — 카드 선택 후에만 표시, PIN 없이 바로 API 호출 */}
          {selectedCardId && (
            <Pressable
              onPress={handleSubmit}
              disabled={submitting || accountLoading}
              className="h-[54px] rounded-2xl justify-center items-center bg-[#1428A0]"
              style={{
                opacity: submitting || accountLoading ? 0.5 : 1,
              }}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text weight="bold" color="white">
                  카드 발급 신청하기
                </Text>
              )}
            </Pressable>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
