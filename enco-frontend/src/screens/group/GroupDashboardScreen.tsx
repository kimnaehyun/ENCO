// src/screens/group/GroupDashboardScreen.tsx
import React, { useMemo } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CommonParams } from '../../types/common';
import { useNotifications } from '../../contexts/NotificationsContext';
import { images } from '../../types/images';
import PaymentStatusCard from '../../components/analytics/PaymentStatusCard';
import BudgetGaugeCard from '../../components/analytics/BudgetGaugeCard';
import ExpenseCategoryCard, {
  ExpenseCategoryItem,
} from '../../components/analytics/ExpenseCategoryCard';
import MonthlyTrendCard, {
  MonthlyExpense,
} from '../../components/analytics/MonthlyTrendCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 20;
const CARD_GAP = 12;
const ANALYTICS_CARD_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
const ANALYTICS_CARD_HEIGHT = 320;

type AnalyticsCardItem =
  | { id: 'payment'; type: 'payment' }
  | { id: 'budget'; type: 'budget' }
  | { id: 'category'; type: 'category' }
  | { id: 'monthly'; type: 'monthly' };

export default function GroupDashboardScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();

  const params = (route.params ?? {}) as CommonParams;
  const groupName = params.groupName ?? '모임명';
  const { unreadCount } = useNotifications();

  const onPressGroupInfo = () =>
    navigation.navigate('GroupInfo', {
      groupId: params.groupId,
      groupName,
      isAdmin: false,
    });

  const onPressLedger = () =>
    navigation.navigate('GroupLedger', {
      groupId: params.groupId,
      groupName,
    });

  const onPressVotes = () =>
    navigation.navigate('GroupVotes', {
      groupId: params.groupId,
      groupName,
    });

  const onPressPay = () =>
    navigation.navigate('GroupPay', {
      groupId: params.groupId,
      groupName,
    });

  const onPressCommunity = () =>
    navigation.navigate('GroupChat', {
      groupId: params.groupId,
      groupName,
    });

  const onPressAdmin = () =>
    navigation.navigate('AdminMenu', {
      groupId: params.groupId,
      groupName,
    });

  const onPressAnalytics = () =>
    navigation.navigate('GroupAnalytics', {
      groupId: params.groupId,
      groupName,
    });

  const onPressInviteEntryTest = () =>
    navigation.navigate('GroupInviteEntry');

  const paidCount = 6;
  const unpaidCount = 2;
  const balance = 854443;
  const totalExpense = 428000;
  const monthlyBudget = 500000;

  const categoryData = useMemo<ExpenseCategoryItem[]>(
    () => [
      { label: '식비', value: 180000, color: '#1428A0' },
      { label: '유흥', value: 90000, color: '#60A5FA' },
      { label: '회비 적립', value: 110000, color: '#818CF8' },
      { label: '기타', value: 48000, color: '#C7D2FE' },
    ],
    []
  );

  const monthlyData = useMemo<MonthlyExpense[]>(
    () => [
      { month: '1월', amount: 210000 },
      { month: '2월', amount: 320000 },
      { month: '3월', amount: 280000 },
      { month: '4월', amount: 410000 },
      { month: '5월', amount: 360000 },
      { month: '6월', amount: 428000 },
    ],
    []
  );

  const analyticsCards: AnalyticsCardItem[] = [
    { id: 'payment', type: 'payment' },
    { id: 'budget', type: 'budget' },
    { id: 'category', type: 'category' },
    { id: 'monthly', type: 'monthly' },
  ];

  const renderAnalyticsCard = ({ item }: { item: AnalyticsCardItem }) => {
    return (
      <View style={{ width: ANALYTICS_CARD_WIDTH }}>
        {item.type === 'payment' && (
          <PaymentStatusCard
            paidCount={paidCount}
            unpaidCount={unpaidCount}
            onPress={onPressAnalytics}
            height={ANALYTICS_CARD_HEIGHT}
          />
        )}

        {item.type === 'budget' && (
          <BudgetGaugeCard
            budget={monthlyBudget}
            spent={totalExpense}
            onPress={onPressAnalytics}
            height={ANALYTICS_CARD_HEIGHT}
          />
        )}

        {item.type === 'category' && (
          <ExpenseCategoryCard
            totalExpense={totalExpense}
            categories={categoryData}
            onPress={onPressAnalytics}
            height={ANALYTICS_CARD_HEIGHT}
          />
        )}

        {item.type === 'monthly' && (
          <MonthlyTrendCard
            data={monthlyData}
            onPress={onPressAnalytics}
            height={ANALYTICS_CARD_HEIGHT}
          />
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#F0F4FF]">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingTop: 56,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View className="flex-row items-center justify-between mb-5">
          <Pressable
            onPress={onPressGroupInfo}
            hitSlop={12}
            className="flex-row items-center gap-2"
          >
            <Text
              style={{
                fontSize: 22,
                fontFamily: 'GmarketSansTTFBold',
                color: '#111827',
              }}
            >
              {groupName}
            </Text>
            <Image
              source={images.alertCircleIcon}
              style={{ width: 20, height: 20, tintColor: '#9CA3AF' }}
              resizeMode="contain"
            />
          </Pressable>

          <Pressable
            onPress={() =>
              navigation.navigate('UserNotifications', {
                groupId: params.groupId,
                groupName,
              })
            }
            hitSlop={12}
            className="w-10 h-10 items-center justify-center"
          >
            <Text style={{ fontSize: 24 }}>🔔</Text>
            {unreadCount > 0 && (
              <View className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-red-500" />
            )}
          </Pressable>
        </View>

        {/* 시각화 카드 스와이프 */}
        <FlatList
          data={analyticsCards}
          keyExtractor={item => item.id}
          renderItem={renderAnalyticsCard}
          horizontal
          pagingEnabled
          snapToInterval={ANALYTICS_CARD_WIDTH + CARD_GAP}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 2 }}
          ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
          style={{ marginBottom: 16 }}
        />

        {/* 잔액 카드 */}
        <Pressable
          onPress={onPressLedger}
          className="bg-white rounded-3xl px-6 mb-4 flex-row items-center justify-between"
          style={{
            height: 72,
            shadowColor: '#1428A0',
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 26 }}>💵</Text>
          <Text
            style={{
              fontSize: 22,
              fontFamily: 'GmarketSansTTFBold',
              color: '#111827',
            }}
          >
            {balance.toLocaleString()}원
          </Text>
        </Pressable>

        {/* 투표 현황 카드 */}
        <Pressable
          onPress={onPressVotes}
          className="bg-white rounded-3xl px-6 mb-4 flex-row items-center justify-between"
          style={{
            height: 72,
            shadowColor: '#1428A0',
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 26 }}>🎟️</Text>
          <Text
            style={{
              fontSize: 18,
              fontFamily: 'GmarketSansTTFBold',
              color: '#111827',
            }}
          >
            투표 현황
          </Text>
        </Pressable>

        {/* 납부 / 채팅 */}
        <View className="flex-row gap-4 mb-4">
          <Pressable
            onPress={onPressPay}
            className="flex-1 bg-white rounded-3xl flex-row items-center justify-center gap-3"
            style={{
              height: 72,
              shadowColor: '#1428A0',
              shadowOpacity: 0.06,
              shadowRadius: 12,
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 22 }}>💰</Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: 'GmarketSansTTFBold',
                color: '#111827',
              }}
            >
              납부
            </Text>
          </Pressable>

          <Pressable
            onPress={onPressCommunity}
            className="flex-1 bg-white rounded-3xl flex-row items-center justify-center gap-3"
            style={{
              height: 72,
              shadowColor: '#1428A0',
              shadowOpacity: 0.06,
              shadowRadius: 12,
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 22 }}>📨</Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: 'GmarketSansTTFBold',
                color: '#111827',
              }}
            >
              채팅
            </Text>
          </Pressable>
        </View>

        {/* 모임 관리 버튼 */}
        <Pressable
          onPress={onPressAdmin}
          className="rounded-3xl py-5 items-center justify-center mb-3"
          style={{ backgroundColor: '#1428A0' }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: 'GmarketSansTTFBold',
              color: '#FFFFFF',
            }}
          >
            모임 관리
          </Text>
        </Pressable>

        {/* 모임초대 진입 테스트 버튼 복구 */}
        <Pressable
          onPress={onPressInviteEntryTest}
          className="rounded-3xl py-4 items-center justify-center"
          style={{ backgroundColor: '#E5E7EB' }}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'GmarketSansTTFBold',
              color: '#374151',
            }}
          >
            모임초대 진입 테스트
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}