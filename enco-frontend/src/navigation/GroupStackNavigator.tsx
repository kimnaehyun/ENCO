// src/navigation/GroupStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TogetherScreen from '../screens/TogetherScreen';

// group screens
import GroupDashboardScreen from '../screens/group/GroupDashboardScreen';
import GroupInfoScreen from '../screens/group/GroupInfoScreen';
import GroupVotesScreen from '../screens/group/GroupVotesScreen';
import GroupPayScreen from '../screens/group/GroupPayScreen';
import GroupChatScreen from '../screens/group/GroupChatScreen';
import GroupLedgerScreen from '../screens/group/GroupLedgerScreen';
import GroupVoteDetailScreen from '../screens/group/GroupVoteDetailScreen'; 
import GroupVoteCreateScreen from '../screens/group/GroupVoteCreateScreen';
// admin screens
import AdminMenuScreen from '../screens/admin/AdminMenuScreen';
import AdminReceiptScreen from '../screens/admin/AdminReceiptScreen';
import AdminMembersScreen from '../screens/admin/AdminMembersScreen';
import AdminSettleScreen from '../screens/admin/AdminSettleScreen';
import AdminCardScreen from '../screens/admin/AdminCardScreen';
import GroupCreateScreen from '../screens/group/GroupCreateScreen';
import GroupCardRecommendScreen from '../screens/group/GroupCardRecommendScreen';
import GroupPinSetupScreen from '../screens/group/GroupPinSetupScreen.tsx';

export type GroupStackParamList = {
  GroupList: undefined;

  GroupDashboard: { groupId?: string; groupName?: string } | undefined;
  GroupInfo: { groupId?: string; groupName?: string; isAdmin?: boolean } | undefined;
  GroupVotes: { groupId?: string; groupName?: string } | undefined;
  GroupPay: { groupId?: string; groupName?: string } | undefined;
  GroupChat: { groupId?: string; groupName?: string } | undefined;
  GroupLedger: { groupId?: string; groupName?: string } | undefined;

  AdminMenu: { groupId?: string; groupName?: string } | undefined;
  AdminReceipt: { groupId?: string; groupName?: string } | undefined;
  AdminMembers: { groupId?: string; groupName?: string } | undefined;
  AdminCard: { groupId?: string; groupName?: string } | undefined;

  // (선택) 투표 상세 같은 거 추가되면 여기 확장
  GroupVoteDetail?: { voteId: string; groupId?: string; groupName?: string };
  GroupCreate: undefined,
  GroupCardRecommend: {
    groupName: string;
    address: string;
    tags: string[];
  };
  GroupPinSetup: {
    groupName: string;
    address: string;
    tags: string[];
    selectedCardId: string;
  };
};

const Stack = createNativeStackNavigator<GroupStackParamList>();

export default function GroupStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="GroupList" screenOptions={{ headerShown: false }}>
      {/* 모임 목록 */}
      <Stack.Screen name="GroupList" component={TogetherScreen} />

      {/* 모임 대시보드 */}
      <Stack.Screen name="GroupDashboard" component={GroupDashboardScreen} />
      <Stack.Screen name="GroupInfo" component={GroupInfoScreen} />

      {/* 기능 페이지 */}
      <Stack.Screen name="GroupLedger" component={GroupLedgerScreen} />
      <Stack.Screen name="GroupVotes" component={GroupVotesScreen} />
      <Stack.Screen name="GroupPay" component={GroupPayScreen} />
      <Stack.Screen name="GroupChat" component={GroupChatScreen} />
      <Stack.Screen name="GroupVoteDetail" component={GroupVoteDetailScreen} />

      {/* 관리자 */}
      <Stack.Screen name="AdminMenu" component={AdminMenuScreen} />
      <Stack.Screen name="AdminReceipt" component={AdminReceiptScreen} />
      <Stack.Screen name="AdminMembers" component={AdminMembersScreen} />
      <Stack.Screen name="AdminCard" component={AdminCardScreen} />
      <Stack.Screen name="GroupVoteCreate" component={GroupVoteCreateScreen} />
      <Stack.Screen name="AdminSettle" component={AdminSettleScreen} />
      <Stack.Screen name="GroupCreate" component={GroupCreateScreen} />
      <Stack.Screen name="GroupCardRecommend" component={GroupCardRecommendScreen} />
      <Stack.Screen name="GroupPinSetup" component={GroupPinSetupScreen} />
    </Stack.Navigator>
  );
}