// src/navigation/GroupStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TogetherScreen from '../screens/TogetherScreen';
import GroupDashboardScreen from '../screens/group/GroupDashboardScreen';
import GroupInfoScreen from '../screens/group/GroupInfoScreen';
import GroupVotesScreen from '../screens/group/GroupVotesScreen';
import GroupPayScreen from '../screens/group/GroupPayScreen';
import GroupChatScreen from '../screens/group/GroupChatScreen';

export type GroupStackParamList = {
  GroupList: undefined;
  GroupDashboard: { groupId?: string; groupName?: string } | undefined;
  GroupInfo: { groupId?: string; groupName?: string } | undefined;
  GroupVotes: { groupId?: string; groupName?: string } | undefined;
  GroupPay: { groupId?: string; groupName?: string } | undefined;
  GroupChat: { groupId?: string; groupName?: string } | undefined;
};

const Stack = createNativeStackNavigator<GroupStackParamList>();

export default function GroupStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="GroupList" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroupList" component={TogetherScreen} />
      <Stack.Screen name="GroupDashboard" component={GroupDashboardScreen} />
      <Stack.Screen name="GroupInfo" component={GroupInfoScreen} />
      <Stack.Screen name="GroupVotes" component={GroupVotesScreen} />
      <Stack.Screen name="GroupPay" component={GroupPayScreen} />
      <Stack.Screen name="GroupChat" component={GroupChatScreen} />
    </Stack.Navigator>
  );
}