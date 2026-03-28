// src/screens/group/GroupDashboardScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
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
import { TOP_SPENDING_COLORS } from '../../constants/analyticsColors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 20;
const CARD_GAP = 12;
const ANALYTICS_CARD_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
const ANALYTICS_CARD_HEIGHT = 320;

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
  const isAdmin = !!params.isAdmin;
  const { unreadCount, notifications } = useNotifications();

  const [dashboardGroupName, setDashboardGroupName] = useState(
    params.groupName ?? '모임명'
  );
  const [reportBalance, setReportBalance] = useState(0);

  const [calculatedMonthlyBudget, setCalculatedMonthlyBudget] = useState(0);
  const [calculatedMonthlySpent, setCalculatedMonthlySpent] = useState(0);

  const [topSpendingItems, setTopSpendingItems] = useState<ExpenseCategoryItem[]>([]);
  const [calculatedTopSpendingTotal, setCalculatedTopSpendingTotal] = useState(0);

  const [calculatedMonthlyData, setCalculatedMonthlyData] = useState<MonthlyExpense[]>([]);
  const [totalMembersCount, setTotalMembersCount] = useState(0);

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const flatListRef = useRef<any>(null);
  const autoScrollPaused = useRef(false);

  const {
    alreadyAttendedToday,
    event: attendanceEvent,
    refresh: refreshAttendance,
  } = useGroupAttendance(groupId);

  useFocusEffect(
    useCallback(() => {
      refreshAttendance();
    }, [refreshAttendance]),
  );

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
        setDashboardGroupName(dashboardData.result.groupName ?? '모임명');

        const reportData = await getGroupDashboardReport(groupId);
        setReportBalance(reportData.result.balance ?? 0);
      } catch (error: any) {
        console.error('[Dashboard] fetch failed:', error?.response?.status, error?.response?.data);
      }
    };
    fetchDashboard();
  }, [groupId]);

  // ✅ 지출 분석 데이터 새로고침 (useCallback으로 재사용 가능하게)
  const fetchAnalytics = useCallback(async () => {
    if (!groupId) return;
    const gid = Number(groupId);
    const now = new Date();
    const thisYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const recentMonths: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      recentMonths.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      );
    }
    const recentMonthsSet = new Set(recentMonths);

    // 예산 계산
    try {
      const [settingsData, membersData] = await Promise.all([
        getGroupSettings(groupId),
        getGroupMembers(groupId),
      ]);
      const rawResult = settingsData.result as any;
      const monthlyFee =
        rawResult.duePolicy?.amount ?? rawResult.policy?.monthlyFee ?? 0;
      const memberCount = membersData.result.length;
      setTotalMembersCount(memberCount);
      setCalculatedMonthlyBudget(monthlyFee * memberCount);
      console.log('[Analytics] monthlyFee:', monthlyFee, 'memberCount:', memberCount);
    } catch (error: any) {
      console.error('[Analytics] budget failed:', error?.response?.status, error?.response?.data);
    }

    // 거래내역 1번 fetch → 이번달 지출 / top5 / 6개월 트렌드 모두 계산
    try {
      const allItems: any[] = [];
      let cursor: number | undefined;
      while (true) {
        const txData = await getGroupTransactions(gid, {
          sort: 'LATEST' as const,
          type: 'WITHDRAW' as const,
          size: 200,
          cursor,
        });
        allItems.push(...txData.result.items);
        if (!txData.result.hasNext || txData.result.nextCursor == null) break;
        cursor = txData.result.nextCursor;
      }
      console.log('[Analytics] 전체 WITHDRAW items:', allItems.length);

      const thisMonthItems = allItems.filter(
        item => item.transactionDate?.slice(0, 7) === thisYM
      );

        // 미확정/취소 건 제외 필터링
        const confirmedThisMonthItems = thisMonthItems.filter(
          item => item.status !== 'PENDING' && item.status !== 'CANCELED'
        );

        // 이번달 지출 합계
      setCalculatedMonthlySpent(
          confirmedThisMonthItems.reduce((sum, item) => sum + item.amount, 0)
      );

      // top 5 결제명
      const groupedMap: Record<string, number> = {};
      confirmedThisMonthItems.forEach(item => {
        const key = item.title || '기타';
        groupedMap[key] = (groupedMap[key] ?? 0) + item.amount;
      });
      const top5 = Object.entries(groupedMap)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      setCalculatedTopSpendingTotal(top5.reduce((sum, item) => sum + item.value, 0));
      setTopSpendingItems(
        top5.map((item, index) => ({
          label: item.label,
          value: item.value,
          color: TOP_SPENDING_COLORS[index] ?? '#CBD5E1',
        }))
      );

      // 최근 6개월 트렌드
      const groupedByMonth: Record<string, number> = {};
      allItems
          .filter(
            item =>
              recentMonthsSet.has(item.transactionDate?.slice(0, 7)) &&
              item.status !== 'PENDING' &&
              item.status !== 'CANCELED'
          )
        .forEach(item => {
          const ym = item.transactionDate.slice(0, 7);
          groupedByMonth[ym] = (groupedByMonth[ym] ?? 0) + item.amount;
        });
      setCalculatedMonthlyData(
        recentMonths.map(ym => ({
          month: `${parseInt(ym.split('-')[1], 10)}월`,
          amount: groupedByMonth[ym] ?? 0,
        }))
      );
    } catch (error: any) {
      console.error('[Analytics] transactions failed:', error?.response?.status, error?.response?.data);
    }
  }, [groupId]);

  // 초기 로드 시 fetchAnalytics 호출
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ✅ SSE 알림 수신 시 자동으로 지출 데이터 새로고침
  useEffect(() => {
    if (!notifications.length) return;
    
    // 최신 알림 확인
    const latestNotification = notifications[0];
    
    // 투표/결제 관련 알림이면 새로고침
    if (
      latestNotification?.groupId === String(groupId) &&
      (latestNotification.type === 'VOTE' || latestNotification.type === 'SETTLEMENT')
    ) {
      console.log('[Dashboard] SSE 알림으로 인한 자동 새로고침:', latestNotification.type);
      fetchAnalytics();
    }
  }, [notifications, groupId, fetchAnalytics]);

  // 3초마다 다음 카드로 자동 스크롤
  useEffect(() => {
    const total = analyticsCards.length;
    const interval = setInterval(() => {
      if (autoScrollPaused.current) return;
      setActiveCardIndex(prev => {
        const next = (prev + 1) % total;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const onPressGroupInfo = () =>
    navigation.navigate('GroupInfo', {
      groupId: params.groupId,
      groupName: dashboardGroupName,
      isAdmin,
    });

  const onPressLedger = () =>
    navigation.navigate('GroupLedger', {
      groupId: params.groupId,
      groupName: dashboardGroupName,
      isAdmin,
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
      isAdmin,
      paySource: 'default',
    });

  const onPressCommunity = () =>
    navigation.navigate('GroupChat', {
      groupId: params.groupId,
      groupName: dashboardGroupName,
      isAdmin,
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
            ref={flatListRef}
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
            onScrollBeginDrag={() => { autoScrollPaused.current = true; }}
            onMomentumScrollEnd={e => {
              autoScrollPaused.current = false;
              const index = Math.round(
                e.nativeEvent.contentOffset.x / (ANALYTICS_CARD_WIDTH + CARD_GAP)
              );
              setActiveCardIndex(index);
            }}
          />
          {/* 페이지 도트 */}
          <View style={styles.dotRow}>
            {analyticsCards.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeCardIndex && styles.dotActive]}
              />
            ))}
          </View>
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

        {/* 모임 관리 버튼 (관리자만 표시) */}
        {isAdmin && (
          <Pressable
            onPress={onPressAdmin}
            className="rounded-3xl py-5 items-center justify-center mb-3"
            style={styles.adminButton}
          >
            <Text style={styles.adminText}>모임 관리</Text>
          </Pressable>
        )}


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
    height: ANALYTICS_CARD_HEIGHT + 24,
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
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: 18,
    backgroundColor: COLORS.brand,
  },
  rewardText: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: FONT_FAMILY.medium,
  },
});