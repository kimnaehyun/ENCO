// src/screens/group/GroupDashboardScreen.tsx
import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CommonParams } from '../../types/common';
import { useNotifications } from '../../contexts/NotificationsContext';
import PieChart, { PieSlice } from '../../components/charts/PieChart';
import { images } from '../../types/images';

export default function GroupDashboardScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();

  const params = (route.params ?? {}) as CommonParams;
  const groupName = params.groupName ?? '모임명';
  const { unreadCount } = useNotifications();

  const onPressGroupInfo = () =>
    navigation.navigate('GroupInfo', { groupId: params.groupId, groupName, isAdmin: false });
  const onPressLedger = () =>
    navigation.navigate('GroupLedger', { groupId: params.groupId, groupName });
  const onPressVotes = () =>
    navigation.navigate('GroupVotes', { groupId: params.groupId, groupName });
  const onPressPay = () =>
    navigation.navigate('GroupPay', { groupId: params.groupId, groupName });
  const onPressCommunity = () =>
    navigation.navigate('GroupChat', { groupId: params.groupId, groupName });
  const onPressAdmin = () =>
    navigation.navigate('AdminMenu', { groupId: params.groupId, groupName });
  const onPressInviteEntryTest = () =>
    navigation.navigate('GroupInviteEntry');
  const onPressAnalytics = () =>
    navigation.navigate('GroupAnalytics', { groupId: params.groupId, groupName });

  // 임시 데이터
  const paidCount = 6;
  const unpaidCount = 2;
  const balance = 854443;

  const pieSlices: PieSlice[] = [
    { value: paidCount, color: '#818CF8' },
    { value: unpaidCount, color: '#86EFAC' },
  ];

  return (
    <View className="flex-1 bg-[#F0F4FF]">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View className="flex-row items-center justify-between mb-5">
          <Pressable onPress={onPressGroupInfo} hitSlop={12} className="flex-row items-center gap-2">
            <Text style={{ fontSize: 22, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}>
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
              navigation.navigate('UserNotifications', { groupId: params.groupId, groupName })
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

        {/* 파이차트 카드 */}
        <Pressable
          onPress={() =>
            navigation.navigate('GroupAnalytics', {
              groupId: params.groupId,
              groupName,
            })
          }
          className="bg-white rounded-3xl p-5 mb-4"
          style={{ shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 }}
        >
          <Text
            style={{ fontSize: 14, color: '#374151', fontFamily: 'GmarketSansTTFBold', marginBottom: 12 }}
          >
            이달의 납부 현황
          </Text>

          <View className="flex-row items-center justify-between my-4">
            <View className="items-start gap-1">
              <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>
                미납 인원
              </Text>
              <Text style={{ fontSize: 16, color: '#22C55E', fontFamily: 'GmarketSansTTFBold' }}>
                {unpaidCount}명
              </Text>
            </View>

            <PieChart slices={pieSlices} size={160} />

            <View className="items-end gap-1">
              <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>
                납부 인원
              </Text>
              <Text style={{ fontSize: 16, color: '#818CF8', fontFamily: 'GmarketSansTTFBold' }}>
                {paidCount}명
              </Text>
            </View>
          </View>
        </Pressable>

        {/* 잔액 카드 */}
        <Pressable
          onPress={onPressLedger}
          className="bg-white rounded-3xl px-6 mb-4 flex-row items-center justify-between"
          style={{ height: 72, shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 }}
        >
          <Text style={{ fontSize: 26 }}>💵</Text>
          <Text style={{ fontSize: 22, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}>
            {balance.toLocaleString()}원
          </Text>
        </Pressable>

        {/* 투표 현황 카드 */}
        <Pressable
          onPress={onPressVotes}
          className="bg-white rounded-3xl px-6 mb-4 flex-row items-center justify-between"
          style={{ height: 72, shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 }}
        >
          <Text style={{ fontSize: 26 }}>🎟️</Text>
          <Text style={{ fontSize: 18, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}>
            투표 현황
          </Text>
        </Pressable>

        {/* 납부 / 채팅 */}
        <View className="flex-row gap-4 mb-4">
          <Pressable
            onPress={onPressPay}
            className="flex-1 bg-white rounded-3xl flex-row items-center justify-center gap-3"
            style={{ height: 72, shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 }}
          >
            <Text style={{ fontSize: 22 }}>💰</Text>
            <Text style={{ fontSize: 16, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}>납부</Text>
          </Pressable>

          <Pressable
            onPress={onPressCommunity}
            className="flex-1 bg-white rounded-3xl flex-row items-center justify-center gap-3"
            style={{ height: 72, shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 }}
          >
            <Text style={{ fontSize: 22 }}>📨</Text>
            <Text style={{ fontSize: 16, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}>채팅</Text>
          </Pressable>
        </View>

        {/* 모임 관리 버튼 */}
        <Pressable
          onPress={onPressAdmin}
          className="rounded-3xl py-5 items-center justify-center mb-3"
          style={{ backgroundColor: '#1428A0' }}
        >
          <Text style={{ fontSize: 18, fontFamily: 'GmarketSansTTFBold', color: '#FFFFFF' }}>
            모임 관리
          </Text>
        </Pressable>

        {/* 초대 진입 테스트 버튼 */}
        <Pressable
          onPress={onPressInviteEntryTest}
          className="rounded-3xl py-4 items-center justify-center"
          style={{ backgroundColor: '#E5E7EB' }}
        >
          <Text style={{ fontSize: 16, fontFamily: 'GmarketSansTTFBold', color: '#374151' }}>
            초대 진입 테스트
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}