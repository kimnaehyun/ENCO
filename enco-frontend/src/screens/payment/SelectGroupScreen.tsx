import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import GroupSelectItem from '../../components/payment/GroupSelectItem';
import Header from '../../components/internet/Header';
import ScreenLayout from '../../components/ScreenLayout';
import { authApi } from '@/services/authService';
import { Group } from '@/types/payment';

export default function SelectGroupScreen({ route }: any) {
  const { paymentType } = route.params;
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await authApi.get('/users/me/groups');
        const data = res.data?.result ?? res.data;
        const leaderGroups = data.filter((g: Group) => g.role === 'LEADER');
        setGroups(leaderGroups);
      } catch (error) {
        console.error('그룹 조회 실패:', error);
      }
    };

    fetchGroups();
  }, []);

  return (
    <ScreenLayout className="gap-4">
      <Header title="모임 목록" />
      {groups.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400 text-sm">
            결제할 수 있는 모임이 없어요
          </Text>
        </View>
      ) : (
        <View className="flex gap-2">
          {groups.map(item => (
            <GroupSelectItem
              key={item.groupId}
              selectedGroupId={Number(item.groupId)}
              title={item.groupName}
              paymentType={paymentType}
            />
          ))}
        </View>
      )}
    </ScreenLayout>
  );
}
