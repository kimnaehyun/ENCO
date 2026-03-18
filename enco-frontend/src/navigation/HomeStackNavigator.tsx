import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import { HomeStackParamList } from '../types/navigation';

// group screens (HomeStack에서도 접근 가능하도록)
import GroupDashboardScreen from '../screens/group/GroupDashboardScreen';
import GroupInfoScreen from '../screens/group/GroupInfoScreen';
import GroupVotesScreen from '../screens/group/GroupVotesScreen';
import GroupPayScreen from '../screens/group/GroupPayScreen';
import GroupChatScreen from '../screens/group/GroupChatScreen';
import GroupLedgerScreen from '../screens/group/GroupLedgerScreen';
import GroupVoteDetailScreen from '../screens/group/GroupVoteDetailScreen';
import VoteCreateScreen from '../screens/InternetPayment/VoteCreateScreen';
import AdminMenuScreen from '../screens/admin/AdminMenuScreen';
import AdminReceiptScreen from '../screens/admin/AdminReceiptScreen';
import AdminMembersScreen from '../screens/admin/AdminMembersScreen';
import AdminSendAlertScreen from '../screens/admin/AdminSendAlertScreen';
import AdminCardScreen from '../screens/admin/AdminCardScreen';
import AdminCardRecommendScreen from '../screens/admin/AdminCardRecommendScreen';
import AdminCardPinScreen from '../screens/admin/AdminCardPinScreen';
import AdminCardDoneScreen from '../screens/admin/AdminCardDoneScreen';
import AdminSettleScreen from '../screens/admin/AdminSettleScreen';
import OcrTestScreen from '../screens/OcrTestScreen';
import GroupLedgerDetailScreen from '../screens/group/GroupLedgerDetailScreen';
import SettleDetailScreen from '../screens/group/SettleDetailScreen';
import SettleMemberSelectScreen from '../screens/group/SettleMemberSelectScreen';

import GroupInviteEntryScreen from '../screens/group/GroupInviteEntryScreen';
import GroupInviteDecisionScreen from '../screens/group/GroupInviteDecisionScreen';
import GroupInviteSuccessScreen from '../screens/group/GroupInviteSuccessScreen';
import NotificationCenterScreen from '../screens/user/NotificationCenterScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 홈 (루트) */}
      <Stack.Screen name="Home" component={HomeScreen} />

      {/*
       * 모임 관련 화면들을 HomeStack에 포함.
       * HomeScreen에서 모임 카드를 누르면 TAB_GROUP으로 점프하지 않고
       * 이 스택 안에서 push → 뒤로가기 시 HomeScreen으로 자연스럽게 복귀.
       */}
      <Stack.Screen name="GroupDashboard" component={GroupDashboardScreen} />
      <Stack.Screen name="GroupInfo" component={GroupInfoScreen} />
      <Stack.Screen name="GroupVotes" component={GroupVotesScreen} />
      <Stack.Screen name="GroupPay" component={GroupPayScreen} />
      <Stack.Screen name="GroupChat" component={GroupChatScreen} />
      <Stack.Screen name="GroupLedger" component={GroupLedgerScreen} />
      <Stack.Screen name="GroupVoteDetail" component={GroupVoteDetailScreen} />
      <Stack.Screen name="VoteCreate" component={VoteCreateScreen} />
      <Stack.Screen name="AdminMenu" component={AdminMenuScreen} />
      <Stack.Screen name="AdminReceipt" component={AdminReceiptScreen} />
      <Stack.Screen name="AdminMembers" component={AdminMembersScreen} />
      <Stack.Screen name="AdminSendAlert" component={AdminSendAlertScreen} />
      <Stack.Screen name="AdminCard" component={AdminCardScreen} />
      <Stack.Screen name="AdminCardRecommend" component={AdminCardRecommendScreen} />
      <Stack.Screen name="AdminCardPin" component={AdminCardPinScreen} />
      <Stack.Screen name="AdminCardDone" component={AdminCardDoneScreen} />
      <Stack.Screen name="AdminSettle" component={AdminSettleScreen} />

      <Stack.Screen
        name="GroupInviteEntry"
        component={GroupInviteEntryScreen}
      />
      <Stack.Screen
        name="GroupInviteDecision"
        component={GroupInviteDecisionScreen}
      />
      <Stack.Screen
        name="GroupInviteSuccess"
        component={GroupInviteSuccessScreen}
      />

      <Stack.Screen name="UserNotifications" component={NotificationCenterScreen} />
      <Stack.Screen name="OcrTest" component={OcrTestScreen} />
      <Stack.Screen
        name="GroupLedgerDetail"
        component={GroupLedgerDetailScreen}
      />
      <Stack.Screen name="SettleDetail" component={SettleDetailScreen} />
      <Stack.Screen
        name="SettleMemberSelect"
        component={SettleMemberSelectScreen}
      />
    </Stack.Navigator>
  );
}