import { View } from 'react-native';
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
        setGroups(data);
      } catch (error) {
        console.error('그룹 조회 실패:', error);
      }
    };

    fetchGroups();
  }, []);

  return (
    <ScreenLayout className="gap-4">
      <Header title="모임 목록" />
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
    </ScreenLayout>
  );
}
