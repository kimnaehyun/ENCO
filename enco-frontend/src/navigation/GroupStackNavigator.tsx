// src/navigation/GroupStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TogetherScreen from '../screens/TogetherScreen';
import GroupDashboardScreen from '../screens/group/GroupDashboardScreen';
import GroupInfoScreen from '../screens/group/GroupInfoScreen';
import GroupVotesScreen from '../screens/group/GroupVotesScreen';
import GroupPayScreen from '../screens/group/GroupPayScreen';
import GroupChatScreen from '../screens/group/GroupChatScreen';
import GroupCreateScreen from '../screens/group/GroupCreateScreen';
import GroupCardRecommendScreen from '../screens/group/GroupCardRecommendScreen';
import GroupPinSetupScreen from '../screens/group/GroupPinSetupScreen.tsx';
import { GroupStackParamList } from '../types/navigation.ts';

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
      <Stack.Screen name="GroupCreate" component={GroupCreateScreen} />
      <Stack.Screen name="GroupCardRecommend" component={GroupCardRecommendScreen} />
      <Stack.Screen name="GroupPinSetup" component={GroupPinSetupScreen} />
    </Stack.Navigator>
  );
}