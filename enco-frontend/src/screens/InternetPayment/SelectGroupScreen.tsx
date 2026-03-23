import { View } from 'react-native';
import React, { useEffect, useState } from 'react';
import GroupSelectItem from '../../components/internet/GroupSelectItem';
import Header from '../../components/internet/Header';
import ScreenLayout from '../../components/ScreenLayout';
import { authApi } from '@/services/authService';

export default function SelectGroupScreen() {
  const [groups, setGroups] = useState<string[]>([]);

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
          <GroupSelectItem key={item} title={item} />
        ))}
      </View>
    </ScreenLayout>
  );
}
