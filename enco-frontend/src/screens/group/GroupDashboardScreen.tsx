// src/screens/group/GroupDashboardScreen.tsx
import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CommonParams } from '../../types/common';
import { useNotifications } from '../../contexts/NotificationsContext';

export default function GroupDashboardScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();

  const params = (route.params ?? {}) as CommonParams;
  const groupName = params.groupName ?? '모임명';
  const { unreadCount } = useNotifications();
  
  const onPressGroupInfo = () => {
    navigation.navigate('GroupInfo', {
      groupId: params.groupId,
      groupName,
      isAdmin: false,
    });
  };

  const onPressLedger = () => {
    navigation.navigate('GroupLedger', { groupId: params.groupId, groupName });
  };

  const onPressVotes = () => {
    navigation.navigate('GroupVotes', { groupId: params.groupId, groupName });
  };

  const onPressPay = () => {
    navigation.navigate('GroupPay', { groupId: params.groupId, groupName });
  };

  const onPressCommunity = () => {
    navigation.navigate('GroupChat', { groupId: params.groupId, groupName });
  };

  const onPressAdmin = () => {
    navigation.navigate('AdminMenu', { groupId: params.groupId, groupName });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4FF', paddingHorizontal: 16, paddingTop: 12 }}>
      {/* Header */}
      <View
        style={{
          marginTop: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <Pressable
          onPress={onPressGroupInfo}
          hitSlop={12}
          style={{
            flex: 1,
            height: 56,
            borderRadius: 16,
            backgroundColor: '#F3F4F6',
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text
            numberOfLines={1}
            style={{ fontSize: 18, fontWeight: '800', color: '#111827', paddingRight: 10 }}
          >
            {groupName}
          </Text>
          <Text style={{ fontSize: 16, color: '#6B7280' }}>ⓘ</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('UserNotifications', { groupId: params.groupId, groupName })}
          hitSlop={12}
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: '#F3F4F6',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 18 }}>🔔</Text>

          {unreadCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: '#FF3B30', // 빨간 점
              }}
            />
          )}
        </Pressable>
      </View>

      {/* Chart placeholder */}
      <View
        style={{
          marginTop: 16,
          height: 240,
          borderRadius: 24,
          backgroundColor: '#E5E7EB',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#6B7280' }}>시각화 영역(임시)</Text>
      </View>

      {/* Balance */}
      <Pressable
        onPress={onPressLedger}
        hitSlop={10}
        style={{
          marginTop: 16,
          height: 88,
          borderRadius: 24,
          backgroundColor: '#E5E7EB',
          paddingHorizontal: 20,
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#374151', fontWeight: '600' }}>남은 금액</Text>
        <Text style={{ marginTop: 6, fontSize: 18, fontWeight: '800' }}>₩ 0 (임시)</Text>
      </Pressable>

      {/* Vote status */}
      <Pressable
        onPress={onPressVotes}
        hitSlop={10}
        style={{
          marginTop: 16,
          height: 64,
          borderRadius: 24,
          backgroundColor: '#E5E7EB',
          paddingHorizontal: 20,
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontWeight: '700' }}>투표 현황</Text>
        <Text style={{ marginTop: 4, color: '#6B7280' }}>눌러서 투표 목록으로 이동(임시)</Text>
      </Pressable>

      {/* Bottom buttons */}
      <View style={{ marginTop: 16, flexDirection: 'row', gap: 12 }}>
        <Pressable
          onPress={onPressPay}
          hitSlop={10}
          style={{
            flex: 1,
            height: 64,
            borderRadius: 24,
            backgroundColor: '#E5E7EB',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontWeight: '800' }}>납부</Text>
        </Pressable>

        <Pressable
          onPress={onPressCommunity}
          hitSlop={10}
          style={{
            flex: 2,
            height: 64,
            borderRadius: 24,
            backgroundColor: '#E5E7EB',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontWeight: '800' }}>커뮤니티(톡방)</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={onPressAdmin}
        hitSlop={10}
        style={{
          marginTop: 16,
          height: 56,
          borderRadius: 18,
          backgroundColor: '#D9D9D9',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontWeight: '900' }}>관리하기</Text>
      </Pressable>
    </View>
  );
}
