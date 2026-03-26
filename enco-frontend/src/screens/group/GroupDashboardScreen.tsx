// src/screens/group/GroupDashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CommonParams } from '../../types/common';
import { useNotifications } from '../../contexts/NotificationsContext';
import { images } from '../../types/images';
import AttendanceDashboardCard from '../../components/attendance/AttendanceDashboardCard';
import BudgetGaugeCard from '../../components/analytics/BudgetGaugeCard';
import ExpenseCategoryCard, {
  ExpenseCategoryItem,
} from '../../components/analytics/ExpenseCategoryCard';
import MonthlyTrendCard, {
  MonthlyExpense,
} from '../../components/analytics/MonthlyTrendCard';
import {
  getGroupDashboard,
  getGroupDashboardReport,
  getGroupTransactions,
} from '../../services/paymentService';
import {
  getGroupSettings,
  getGroupMembers,
} from '../../services/groupService';
import { useGroupAttendance } from '../../hooks/useGroupAttendance';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 20;
const CARD_GAP = 12;
const ANALYTICS_CARD_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
const ANALYTICS_CARD_HEIGHT = 320;

const TOP_SPENDING_COLORS = [
  COLORS.brand,
  '#60A5FA',
  '#818CF8',
  '#C7D2FE',
  '#CBD5E1',
];

type AnalyticsCardItem =
  | { id: 'attendance'; type: 'attendance' }
  | { id: 'budget'; type: 'budget' }
  | { id: 'category'; type: 'category' }
  | { id: 'monthly'; type: 'monthly' };

export default function GroupDashboardScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();

  const { top: topInset } = useSafeAreaInsets();
  const params = (route.params ?? {}) as CommonParams;
  const groupId = params.groupId;
  const { unreadCount } = useNotifications();

  const [dashboardGroupName, setDashboardGroupName] = useState(
    params.groupName ?? '모임명'
  );
  const [paidCount, setPaidCount] = useState(0);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [paidRatio, setPaidRatio] = useState(0);
  const [unpaidRatio, setUnpaidRatio] = useState(0);
  const [balance, setBalance] = useState(0);
  const [reportBalance, setReportBalance] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [pointAmount, setPointAmount] = useState(0);

  const [calculatedMonthlyBudget, setCalculatedMonthlyBudget] = useState(0);
  const [calculatedMonthlySpent, setCalculatedMonthlySpent] = useState(0);
  const [isLoadingBudgetGauge, setIsLoadingBudgetGauge] = useState(false);

  const [topSpendingItems, setTopSpendingItems] = useState<ExpenseCategoryItem[]>([]);
  const [calculatedTopSpendingTotal, setCalculatedTopSpendingTotal] = useState(0);

  const [calculatedMonthlyData, setCalculatedMonthlyData] = useState<MonthlyExpense[]>([]);
  const [totalMembersCount, setTotalMembersCount] = useState(0);

  const {
    alreadyAttendedToday,
    event: attendanceEvent,
  } = useGroupAttendance(groupId);

  const attendedCount = attendanceEvent?.currentMemberCount ?? 0;
  const rewardThreshold =
    totalMembersCount > 0 && attendanceEvent?.targetMemberCount
      ? attendanceEvent.targetMemberCount / totalMembersCount
      : 0.7;

  const analyticsCards: AnalyticsCardItem[] = [
    { id: 'attendance', type: 'attendance' },
    { id: 'budget', type: 'budget' },
    { id: 'category', type: 'category' },
    { id: 'monthly', type: 'monthly' },
  ];


  useEffect(() => {
    const fetchDashboard = async () => {
      if (!groupId) return;
      try {
        const dashboardData = await getGroupDashboard(Number(groupId));
        const result = dashboardData.result;

        setDashboardGroupName(result.groupName ?? '모임명');
        setPaidCount(result.paymentStatus?.paidCount ?? 0);
        setUnpaidCount(result.paymentStatus?.unpaidCount ?? 0);
        setPaidRatio(result.paymentStatus?.paidRatio ?? 0);
        setUnpaidRatio(result.paymentStatus?.unpaidRatio ?? 0);
        setBalance(result.balance ?? 0);

        const reportData = await getGroupDashboardReport(groupId);
        const reportResult = reportData.result;
        setReportBalance(reportResult.balance ?? 0);
        setPaidAmount(reportResult.paidAmount ?? 0);
        setPointAmount(reportResult.pointAmount ?? 0);
      } catch (error: any) {
        console.error('모임 대시보드 조회 실패:', error);
        console.error('error.response?.status:', error?.response?.status);
        console.error('error.response?.data:', error?.response?.data);
      }
    };

    fetchDashboard();
  }, [groupId]);

  useEffect(() => {
    const fetchBudget = async () => {
      if (!groupId) return;
      setIsLoadingBudgetGauge(true);
      try {
        const [settingsData, membersData] = await Promise.all([
          getGroupSettings(groupId),
          getGroupMembers(groupId),
        ]);

        // 모임 설정 전체 응답 로그
        console.log('[BudgetGauge] settingsData.result:', JSON.stringify(settingsData.result, null, 2));

        // GET 응답 필드명이 duePolicy / policy 두 가지일 수 있으므로 방어적으로 읽음
        const rawResult = settingsData.result as any;
        const monthlyFee =
          rawResult.duePolicy?.amount ?? rawResult.policy?.monthlyFee ?? 0;
        console.log('[BudgetGauge] duePolicy raw:', JSON.stringify(rawResult.duePolicy, null, 2));
        console.log('[BudgetGauge] policy raw (fallback):', JSON.stringify(rawResult.policy, null, 2));
        const memberCount = membersData.result.length;
        setTotalMembersCount(memberCount);
        const budget = monthlyFee * memberCount;

        console.log('[BudgetGauge] duePolicy.amount (monthlyFee):', monthlyFee);
        console.log('[BudgetGauge] memberCount:', memberCount);
        console.log('[BudgetGauge] calculatedMonthlyBudget:', budget);

        setCalculatedMonthlyBudget(budget);

        const now = new Date();
        const thisYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        console.log('[BudgetGauge] groupId:', groupId);
        console.log('[BudgetGauge] 클라이언트 필터 기준 월:', thisYM);

        const allWithdrawItems: any[] = [];
        let cursor: number | undefined;
        while (true) {
          const txData = await getGroupTransactions(Number(groupId), {
            sort: 'LATEST' as const,
            type: 'WITHDRAW' as const,
            size: 100,
            cursor,
          });
          allWithdrawItems.push(...txData.result.items);
          if (!txData.result.hasNext || txData.result.nextCursor == null) break;
          cursor = txData.result.nextCursor;
        }

        // 클라이언트에서 이번 달만 필터
        const thisMonthItems = allWithdrawItems.filter(item =>
          item.transactionDate?.slice(0, 7) === thisYM
        );
        console.log('[BudgetGauge] 전체 items:', allWithdrawItems.length, '/ 이번 달:', thisMonthItems.length);

        let totalSpent = 0;
        for (const item of thisMonthItems) {
          totalSpent += item.amount;
        }

        console.log('[BudgetGauge] calculatedMonthlySpent:', totalSpent);
        setCalculatedMonthlySpent(totalSpent);

        console.log('[BudgetGauge] final budget:', budget);
        console.log('[BudgetGauge] final spent:', totalSpent);
      } catch (error: any) {
        console.error('[BudgetGauge] failed:', error);
        console.error('[BudgetGauge] status:', error?.response?.status);
        console.error('[BudgetGauge] data:', error?.response?.data);
      } finally {
        setIsLoadingBudgetGauge(false);
      }
    };
    fetchBudget();
  }, [groupId]);

  useEffect(() => {
    const fetchTopSpendings = async () => {
      if (!groupId) return;
      try {
        const now = new Date();
        const thisYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const allItems: any[] = [];
        let cursor: number | undefined;
        while (true) {
          const txData = await getGroupTransactions(Number(groupId), {
            sort: 'LATEST' as const,
            type: 'WITHDRAW' as const,
            size: 100,
            cursor,
          });
          allItems.push(...txData.result.items);
          if (!txData.result.hasNext || txData.result.nextCursor == null) break;
          cursor = txData.result.nextCursor;
        }

        // 클라이언트에서 이번 달만 필터
        const withdrawItems = allItems.filter(item =>
          item.transactionDate?.slice(0, 7) === thisYM
        );

        console.log('[TopSpendings] withdraw items:', withdrawItems);

        const groupedMap: Record<string, number> = {};
        withdrawItems.forEach(item => {
          const key = item.title || '기타';
          groupedMap[key] = (groupedMap[key] ?? 0) + item.amount;
        });

        console.log('[TopSpendings] grouped map:', groupedMap);

        const topSpendingTitles = Object.entries(groupedMap)
          .map(([label, value]) => ({ label, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        console.log('[TopSpendings] top 5 titles:', topSpendingTitles);

        const calculatedTotalExpense = topSpendingTitles.reduce(
          (sum, item) => sum + item.value,
          0
        );
        console.log('[TopSpendings] totalExpense:', calculatedTotalExpense);

        const coloredItems: ExpenseCategoryItem[] = topSpendingTitles.map(
          (item, index) => ({
            label: item.label,
            value: item.value,
            color: TOP_SPENDING_COLORS[index] ?? '#CBD5E1',
          })
        );

        setTopSpendingItems(coloredItems);
        setCalculatedTopSpendingTotal(calculatedTotalExpense);
      } catch (error: any) {
        console.error('[TopSpendings] failed:', error);
        console.error('[TopSpendings] status:', error?.response?.status);
        console.error('[TopSpendings] data:', error?.response?.data);
      }
    };

    fetchTopSpendings();
  }, [groupId]);

  useEffect(() => {
    const fetchMonthlyTrend = async () => {
      if (!groupId) return;
      try {
        const now = new Date();

        // 최근 6개월 YYYY-MM 배열 생성 (현재 월 포함)
        const recentMonths: string[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          recentMonths.push(`${y}-${m}`);
        }

        const recentMonthsSet = new Set(recentMonths);

        const allItems: any[] = [];
        let cursor: number | undefined;
        while (true) {
          const txData = await getGroupTransactions(Number(groupId), {
            sort: 'LATEST' as const,
            type: 'WITHDRAW' as const,
            size: 200,
            cursor,
          });
          allItems.push(...txData.result.items);
          if (!txData.result.hasNext || txData.result.nextCursor == null) break;
          cursor = txData.result.nextCursor;
        }

        // 클라이언트에서 최근 6개월만 필터
        const withdrawItems = allItems.filter(item =>
          recentMonthsSet.has(item.transactionDate?.slice(0, 7))
        );

        console.log('[MonthlyTrend] withdraw items:', withdrawItems);

        // transactionDate 기준으로 YYYY-MM 그룹핑
        const groupedByMonth: Record<string, number> = {};
        withdrawItems.forEach(item => {
          const ym = item.transactionDate.slice(0, 7); // 'YYYY-MM'
          groupedByMonth[ym] = (groupedByMonth[ym] ?? 0) + item.amount;
        });

        console.log('[MonthlyTrend] grouped by month:', groupedByMonth);

        // 빈 달은 0으로 채워 최근 6개월 배열 완성
        const finalMonthlyData: MonthlyExpense[] = recentMonths.map(ym => ({
          month: `${parseInt(ym.split('-')[1], 10)}월`,
          amount: groupedByMonth[ym] ?? 0,
        }));

        const validMonthCount = finalMonthlyData.filter(d => d.amount > 0).length;

        console.log('[MonthlyTrend] final monthly data:', finalMonthlyData);
        console.log('[MonthlyTrend] valid non-zero months:', validMonthCount);

        setCalculatedMonthlyData(finalMonthlyData);
      } catch (error: any) {
        console.error('[MonthlyTrend] failed:', error);
        console.error('[MonthlyTrend] status:', error?.response?.status);
        console.error('[MonthlyTrend] data:', error?.response?.data);
      }
    };

    fetchMonthlyTrend();
  }, [groupId]);

  const onPressGroupInfo = () =>
    navigation.navigate('GroupInfo', {
      groupId: params.groupId,
      groupName: dashboardGroupName,
      isAdmin: false,
    });

  const onPressLedger = () =>
    navigation.navigate('GroupLedger', {
      groupId: params.groupId,
      groupName: dashboardGroupName,
    });

  const onPressVotes = () =>
    navigation.navigate('GroupVotes', {
      groupId: params.groupId,
      groupName: dashboardGroupName,
    });

  const onPressPay = () =>
    navigation.navigate('GroupPay', {
      groupId: params.groupId,
      groupName: dashboardGroupName,
      paySource: 'default',
    });

  const onPressCommunity = () =>
    navigation.navigate('GroupChat', {
      groupId: params.groupId,
      groupName: dashboardGroupName,
    });

  const onPressAdmin = () =>
    navigation.navigate('AdminMenu', {
      groupId: params.groupId,
      groupName: dashboardGroupName,
    });

  const onPressAnalytics = () =>
    navigation.navigate('GroupAnalytics', {
      groupId: params.groupId,
      groupName: dashboardGroupName,
    });

  const onPressAttendance = () => {
    console.log('[Dashboard→Attendance] 출석 화면으로 이동');
    console.log('[Dashboard→Attendance] groupId:', params.groupId);
    console.log('[Dashboard→Attendance] groupName:', dashboardGroupName);
    navigation.navigate('GroupAttendance', {
      groupId: params.groupId,
      groupName: dashboardGroupName,
    });
  };

  const onPressInviteEntryTest = () => navigation.navigate('GroupInviteEntry');

  const renderAnalyticsCard = ({ item }: { item: AnalyticsCardItem }) => {
    return (
      <View style={{ width: ANALYTICS_CARD_WIDTH }}>
        {item.type === 'attendance' && (
          <AttendanceDashboardCard
            alreadyAttendedToday={alreadyAttendedToday}
            attendedCount={attendedCount}
            totalMembers={totalMembersCount}
            rewardThreshold={rewardThreshold}
            height={ANALYTICS_CARD_HEIGHT}
            onPress={onPressAttendance}
          />
        )}

        {item.type === 'budget' && (
          <BudgetGaugeCard
            budget={calculatedMonthlyBudget}
            spent={calculatedMonthlySpent}
            onPress={onPressAnalytics}
            height={ANALYTICS_CARD_HEIGHT}
          />
        )}

        {item.type === 'category' && (
          <ExpenseCategoryCard
            totalExpense={calculatedTopSpendingTotal}
            categories={topSpendingItems}
            onPress={onPressAnalytics}
            height={ANALYTICS_CARD_HEIGHT}
          />
        )}

        {item.type === 'monthly' && (
          <MonthlyTrendCard
            data={calculatedMonthlyData}
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
        contentContainerStyle={[styles.scrollContent, { paddingTop: topInset + 16 }]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {/* 헤더 */}
        <View className="flex-row items-center justify-between mb-5">
          <Pressable
            onPress={onPressGroupInfo}
            hitSlop={12}
            className="flex-row items-center gap-2"
          >
            <Text style={styles.groupNameText}>{dashboardGroupName}</Text>
            <Image
              source={images.alertCircleIcon}
              style={styles.alertIcon}
              resizeMode="contain"
            />
          </Pressable>

          <Pressable
            onPress={() =>
              navigation.navigate('UserNotifications', {
                groupId: params.groupId,
                groupName: dashboardGroupName,
              })
            }
            hitSlop={12}
            className="w-10 h-10 items-center justify-center"
          >
            <Text style={styles.bellEmoji}>🔔</Text>
            {unreadCount > 0 && (
              <View className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-red-500" />
            )}
          </Pressable>
        </View>

        {/* 시각화 카드 스와이프 */}
        <View style={styles.analyticsSection}>
          <FlatList
            data={analyticsCards}
            keyExtractor={item => item.id}
            renderItem={renderAnalyticsCard}
            horizontal
            snapToInterval={ANALYTICS_CARD_WIDTH + CARD_GAP}
            snapToAlignment="start"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
            style={styles.flatList}
          />
        </View>

        {/* 잔액 카드 */}
        <Pressable
          onPress={onPressLedger}
          className="bg-white rounded-3xl px-6 py-5 mb-4"
          style={styles.reportCard}
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text style={styles.balanceEmoji}>💵</Text>
            <Text style={styles.balanceValue}>
              {reportBalance.toLocaleString()}원
            </Text>
          </View>
        </Pressable>

        {/* 투표 현황 카드 */}
        <Pressable
          onPress={onPressVotes}
          className="bg-white rounded-3xl px-6 mb-4 flex-row items-center justify-between"
          style={styles.shadowCard}
        >
          <Text style={styles.votesEmoji}>🎟️</Text>
          <Text style={styles.votesText}>투표 현황</Text>
        </Pressable>

        {/* 납부 / 채팅 */}
        <View style={styles.actionRow}>
          <Pressable
            onPress={onPressPay}
            className="flex-1 bg-white rounded-3xl flex-row items-center justify-center gap-3"
            style={styles.shadowCard}
          >
            <Text style={styles.actionEmoji}>💰</Text>
            <Text style={styles.actionText}>납부</Text>
          </Pressable>

          <Pressable
            onPress={onPressCommunity}
            className="flex-1 bg-white rounded-3xl flex-row items-center justify-center gap-3"
            style={styles.shadowCard}
          >
            <Text style={styles.actionEmoji}>📨</Text>
            <Text style={styles.actionText}>채팅</Text>
          </Pressable>
        </View>

        {/* 모임 관리 버튼 */}
        <Pressable
          onPress={onPressAdmin}
          className="rounded-3xl py-5 items-center justify-center mb-3"
          style={styles.adminButton}
        >
          <Text style={styles.adminText}>모임 관리</Text>
        </Pressable>

        {/* 모임초대 진입 테스트 버튼 */}
        <Pressable
          onPress={onPressInviteEntryTest}
          className="rounded-3xl py-4 items-center justify-center"
          style={styles.inviteTestButton}
        >
          <Text style={styles.inviteTestText}>모임초대 진입 테스트</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  analyticsSection: {
    height: ANALYTICS_CARD_HEIGHT,
    marginBottom: 16,
    overflow: 'hidden',
  },
  flatList: {
    height: ANALYTICS_CARD_HEIGHT,
  },
  flatListContent: {},
  cardSeparator: {
    width: CARD_GAP,
  },
  groupNameText: {
    fontSize: 24,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
  },
  alertIcon: {
    width: 18,
    height: 18,
  },
  bellEmoji: {
    fontSize: 26,
  },
  reportCard: {},
  shadowCard: {
    minHeight: 90,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  balanceEmoji: {
    fontSize: 24,
  },
  balanceValue: {
    fontSize: 28,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
  },
  votesEmoji: {
    fontSize: 28,
  },
  votesText: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    position: 'relative',
    zIndex: 10,
    elevation: 10,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionText: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
  },
  adminButton: {
    backgroundColor: '#1428A0',
  },
  adminText: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.bold,
    color: '#FFFFFF',
  },
  inviteTestButton: {
    backgroundColor: '#E5E7EB',
  },
  inviteTestText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.medium,
    color: COLORS.primary,
  },
  attendanceCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 20,
    minHeight: ANALYTICS_CARD_HEIGHT,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
  },
  attendanceBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  attendanceBadgeText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.bold,
    color: '#1428A0',
  },
  attendanceInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodImage: {
    width: 100,
    height: 100,
    marginBottom: 14,
  },
  moodTitle: {
    fontSize: 20,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
    textAlign: 'center',
  },
  moodSubtitle: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.medium,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
  },
  progressBarWrap: {
    width: '100%',
    marginTop: 18,
  },
  progressBarBg: {
    width: '100%',
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  membersText: {
    marginTop: 12,
    fontSize: 15,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
  },
  rewardText: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: FONT_FAMILY.medium,
  },
});