import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CommonParams } from '../../types/common';
import { useNotifications } from '../../contexts/NotificationsContext';
import { images } from '../../types/images';
import BudgetGaugeCard from '../../components/analytics/BudgetGaugeCard';
import ExpenseCategoryCard, {
  ExpenseCategoryItem,
} from '../../components/analytics/ExpenseCategoryCard';
import MonthlyTrendCard, {
  MonthlyExpense,
} from '../../components/analytics/MonthlyTrendCard';
import { getGroupDashboard, getGroupDashboardReport } from '../../services/paymentService';

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

  const params = (route.params ?? {}) as CommonParams;
  const groupId = params.groupId;
  const { unreadCount } = useNotifications();

  // --- useState ---
  const [dashboardGroupName, setDashboardGroupName] = useState(
    params.groupName ?? '모임명',
  );
  const [paidCount, setPaidCount] = useState(0);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [paidRatio, setPaidRatio] = useState(0);
  const [unpaidRatio, setUnpaidRatio] = useState(0);
  const [balance, setBalance] = useState(0);
  const [reportBalance, setReportBalance] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [pointAmount, setPointAmount] = useState(0);
  // --- 상수 ---
  const totalExpense = 428000;
  const monthlyBudget = 500000;

  // TODO: 백엔드 연결 후 실제 출석 데이터로 교체
  const attendedCount = 6;
  const totalMembers = 10;
  const attendanceRewardThreshold = 0.7;
  const attendanceRatio = attendedCount / totalMembers;
  const requiredCount = Math.ceil(totalMembers * attendanceRewardThreshold);

  // --- useMemo ---
  const categoryData = useMemo<ExpenseCategoryItem[]>(
    () => [
      { label: '식비', value: 180000, color: '#1428A0' },
      { label: '유흥', value: 90000, color: '#60A5FA' },
      { label: '회비 적립', value: 110000, color: '#818CF8' },
      { label: '기타', value: 48000, color: '#C7D2FE' },
    ],
    [],
  );

  const monthlyData = useMemo<MonthlyExpense[]>(
    () => [
      { month: '1월', amount: 210000 },
      { month: '2월', amount: 320000 },
      { month: '3월', amount: 280000 },
      { month: '4월', amount: 410000 },
      { month: '5월', amount: 360000 },
      { month: '6월', amount: 428000 },
    ],
    [],
  );

  const analyticsCards: AnalyticsCardItem[] = [
    { id: 'attendance', type: 'attendance' },
    { id: 'budget', type: 'budget' },
    { id: 'category', type: 'category' },
    { id: 'monthly', type: 'monthly' },
  ];

  const attendanceMood = useMemo(() => {
    if (attendanceRatio === 0) {
      return {
        title: '아직 아무도 출석하지 않았어요',
        subtitle: '첫 출석을 시작해보세요',
        accent: '#EF4444',
        imageSource: require('../../assets/icons/sad_hamco.png'),
      };
    }

    if (attendanceRatio < attendanceRewardThreshold) {
      return {
        title: '조금만 더 출석하면 목표 달성!',
        subtitle: `${requiredCount - attendedCount}명만 더 출석하면 돼요`,
        accent: '#1428A0',
        imageSource: require('../../assets/icons/run_hamco.png'),
      };
    }

    return {
      title: '오늘 출석 목표 달성!',
      subtitle: '모임 분위기가 아주 좋아요',
      accent: '#22C55E',
      imageSource: require('../../assets/icons/welcom_hamco.png'),
    };
  }, [attendanceRatio, attendanceRewardThreshold, attendedCount, requiredCount]);

  // --- useEffect ---
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        console.log('dashboard groupId 확인:', groupId);

        const dashboardData = await getGroupDashboard(groupId);
        console.log('모임 대시보드 조회 성공:', dashboardData);
        console.log('대시보드 result:', dashboardData.result);

        const result = dashboardData.result;

        setDashboardGroupName(result.groupName ?? '모임명');
        setPaidCount(result.paymentStatus?.paidCount ?? 0);
        setUnpaidCount(result.paymentStatus?.unpaidCount ?? 0);
        setPaidRatio(result.paymentStatus?.paidRatio ?? 0);
        setUnpaidRatio(result.paymentStatus?.unpaidRatio ?? 0);
        setBalance(result.balance ?? 0);

        const reportData = await getGroupDashboardReport(groupId);
        console.log('모임비 대시보드 조회 성공:', reportData);
        console.log('모임비 대시보드 result:', reportData.result);

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

  // --- 네비게이션 핸들러 ---
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

  const onPressAttendance = () =>
    navigation.navigate('GroupAttendance', {
      groupId: params.groupId,
      groupName: dashboardGroupName,
    });

  const onPressInviteEntryTest = () => navigation.navigate('GroupInviteEntry');

  const renderAnalyticsCard = ({ item }: { item: AnalyticsCardItem }) => {
    return (
      <View style={{ width: ANALYTICS_CARD_WIDTH }}>
        {item.type === 'attendance' && (
          <Pressable onPress={onPressAttendance} style={styles.attendanceCard}>
            <View style={styles.attendanceHeader}>
              <Text style={styles.attendanceTitle}>오늘의 출석 체크</Text>
              <View style={styles.attendanceBadge}>
                <Text style={styles.attendanceBadgeText}>
                  출석률 {Math.round(attendanceRatio * 100)}%
                </Text>
              </View>
            </View>

            <View style={styles.attendanceInner}>
              <Image
                source={attendanceMood.imageSource}
                style={styles.moodImage}
                resizeMode="contain"
              />

              <Text style={styles.moodTitle}>{attendanceMood.title}</Text>

              <Text style={styles.moodSubtitle}>{attendanceMood.subtitle}</Text>

              <View style={styles.progressBarWrap}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(attendanceRatio * 100, 100)}%`,
                        backgroundColor: attendanceMood.accent,
                      },
                    ]}
                  />
                </View>
              </View>

              <Text style={styles.membersText}>
                {attendedCount} / {totalMembers}명 출석
              </Text>

              <Text
                style={[
                  styles.rewardText,
                  {
                    color:
                      attendanceRatio >= attendanceRewardThreshold
                        ? '#22C55E'
                        : '#6B7280',
                  },
                ]}
              >
                {attendanceRatio >= attendanceRewardThreshold
                  ? '오늘 보상 목표 달성!'
                  : `${requiredCount}명 목표까지 ${requiredCount - attendedCount}명 남음`}
              </Text>
            </View>
          </Pressable>
        )}

        {item.type === 'budget' && (
          <BudgetGaugeCard
            budget={monthlyBudget}
            spent={totalExpense}
            onPress={onPressAnalytics}
            height={ANALYTICS_CARD_HEIGHT}
          />
        )}

        {item.type === 'category' && (
          <ExpenseCategoryCard
            totalExpense={totalExpense}
            categories={categoryData}
            onPress={onPressAnalytics}
            height={ANALYTICS_CARD_HEIGHT}
          />
        )}

        {item.type === 'monthly' && (
          <MonthlyTrendCard
            data={monthlyData}
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
        <FlatList
          data={analyticsCards}
          keyExtractor={item => item.id}
          renderItem={renderAnalyticsCard}
          horizontal
          pagingEnabled
          snapToInterval={ANALYTICS_CARD_WIDTH + CARD_GAP}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
          style={styles.flatList}
        />

        {/* 잔액 카드 */}
        <Pressable
          onPress={onPressLedger}
          className="bg-white rounded-3xl px-6 py-5 mb-4"
          style={styles.reportCard}
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text style={styles.balanceEmoji}>💵</Text>
            <Text style={styles.balanceValue}>{reportBalance.toLocaleString()}원</Text>
          </View>

          {/* <View className="flex-row items-center justify-between">
            <Text style={styles.statusLabel}>총 납부액</Text>
            <Text style={styles.statusValue}>{paidAmount.toLocaleString()}원</Text>
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <Text style={styles.statusLabel}>적립 포인트</Text>
            <Text style={styles.statusValue}>{pointAmount.toLocaleString()}P</Text>
          </View> */}
        </Pressable>

        {/* 납부/미납 현황 카드 */}
        {/* <View
          className="bg-white rounded-3xl px-6 py-5 mb-4"
          style={styles.shadowCard}
        >
          <Text style={styles.statusTitle}>회비 납부 현황</Text>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>납부</Text>
            <Text style={styles.statusValue}>
              {paidCount}명 ({paidRatio}%)
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>미납</Text>
            <Text style={styles.statusValue}>
              {unpaidCount}명 ({unpaidRatio}%)
            </Text>
          </View> */}
        

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
        <View className="flex-row gap-4 mb-4">
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
  // 레이아웃
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 56,
    paddingBottom: 32,
  },
  flatList: {
    marginBottom: 16,
  },
  flatListContent: {
    paddingRight: 2,
  },
  cardSeparator: {
    width: CARD_GAP,
  },

  // 공통 카드 그림자
  shadowCard: {
    height: 72,
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },

  // 헤더
  groupNameText: {
    fontSize: 22,
    fontFamily: 'GmarketSansTTFBold',
    color: '#111827',
  },
  alertIcon: {
    width: 20,
    height: 20,
    tintColor: '#9CA3AF',
  },
  bellEmoji: {
    fontSize: 24,
  },

  // 잔액 카드
  reportCard: {
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  balanceEmoji: {
    fontSize: 26,
  },
  balanceValue: {
    fontSize: 22,
    fontFamily: 'GmarketSansTTFBold',
    color: '#111827',
  },
  statusLabel: {
    fontSize: 14,
    fontFamily: 'GmarketSansTTFMedium',
    color: '#6B7280',
  },
  statusValue: {
    fontSize: 14,
    fontFamily: 'GmarketSansTTFBold',
    color: '#111827',
  },

  // 투표 카드
  votesEmoji: {
    fontSize: 26,
  },
  votesText: {
    fontSize: 18,
    fontFamily: 'GmarketSansTTFBold',
    color: '#111827',
  },

  // 납부 / 채팅
  actionEmoji: {
    fontSize: 22,
  },
  actionText: {
    fontSize: 16,
    fontFamily: 'GmarketSansTTFBold',
    color: '#111827',
  },

  // 모임 관리 버튼
  adminButton: {
    backgroundColor: '#1428A0',
  },
  adminText: {
    fontSize: 18,
    fontFamily: 'GmarketSansTTFBold',
    color: '#FFFFFF',
  },

  // 테스트 버튼
  inviteTestButton: {
    backgroundColor: '#E5E7EB',
  },
  inviteTestText: {
    fontSize: 16,
    fontFamily: 'GmarketSansTTFBold',
    color: '#374151',
  },

  // 출석 카드
  attendanceCard: {
    width: ANALYTICS_CARD_WIDTH,
    height: ANALYTICS_CARD_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 20,
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  attendanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  attendanceTitle: {
    fontSize: 15,
    color: '#111827',
    fontFamily: 'GmarketSansTTFBold',
  },
  attendanceBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  attendanceBadgeText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFMedium',
  },
  attendanceInner: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  moodImage: {
    width: 92,
    height: 92,
    marginBottom: 12,
  },
  moodTitle: {
    fontSize: 17,
    color: '#111827',
    fontFamily: 'GmarketSansTTFBold',
    textAlign: 'center',
    marginBottom: 6,
  },
  moodSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFMedium',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  progressBarWrap: {
    width: '100%',
    maxWidth: 220,
    marginBottom: 10,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  membersText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'GmarketSansTTFMedium',
    textAlign: 'center',
  },
  rewardText: {
    fontSize: 12,
    fontFamily: 'GmarketSansTTFBold',
    marginTop: 8,
  },
});
