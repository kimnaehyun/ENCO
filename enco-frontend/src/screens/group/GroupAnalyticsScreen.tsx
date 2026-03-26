import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';
import BudgetGaugeCard from '../../components/analytics/BudgetGaugeCard';
import ExpenseCategoryCard, {
  ExpenseCategoryItem,
} from '../../components/analytics/ExpenseCategoryCard';
import MonthlyTrendCard, {
  MonthlyExpense,
} from '../../components/analytics/MonthlyTrendCard';
import {
  getGroupDashboardReport,
  getGroupTransactions,
} from '../../services/paymentService';
import {
  getGroupSettings,
  getGroupMembers,
} from '../../services/groupService';

import { TOP_SPENDING_COLORS } from '../../constants/analyticsColors';

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function GroupAnalyticsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;
  const groupId = params.groupId;
  const groupName = params.groupName ?? '모임명';

  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState(0);

  const [topSpendingItems, setTopSpendingItems] = useState<ExpenseCategoryItem[]>([]);
  const [topSpendingTotal, setTopSpendingTotal] = useState(0);

  const [monthlyData, setMonthlyData] = useState<MonthlyExpense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;

    const fetchAll = async () => {
      setIsLoading(true);
      setFetchError(null);
      const gid = Number(groupId);
      const now = new Date();
      const thisYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // 최근 6개월 YYYY-MM 배열
      const recentMonths: string[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        recentMonths.push(
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        );
      }
      const recentMonthsSet = new Set(recentMonths);

      // ── 예산 계산 (settings + members) ──
      try {
        const [settingsData, membersData] = await Promise.all([
          getGroupSettings(groupId),
          getGroupMembers(groupId),
        ]);
        const rawResult = settingsData.result as any;
        const feePerMember =
          rawResult.duePolicy?.amount ?? rawResult.policy?.monthlyFee ?? 0;
        const memberCount = membersData.result.length;
        const budget = feePerMember * memberCount;
        console.log('[Analytics] feePerMember:', feePerMember, 'memberCount:', memberCount, 'budget:', budget);
        setMonthlyBudget(budget);
      } catch (error: any) {
        console.error('[Analytics] budget fetch failed:', error?.response?.status, error?.response?.data);
      }

      // ── 입금 / 잔액 (dashboard report) ──
      try {
        const reportData = await getGroupDashboardReport(groupId);
        console.log('[Analytics] report:', reportData.result);
        setTotalIncome(reportData.result.paidAmount ?? 0);
        setCurrentBalance(reportData.result.balance ?? 0);
      } catch (error: any) {
        console.error('[Analytics] report fetch failed:', error?.response?.status, error?.response?.data);
      }

      // ── 거래내역 (WITHDRAW 전체 → 클라이언트 필터) ──
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

        // 이번 달 지출 합계
        const thisMonthItems = allItems.filter(
          item => item.transactionDate?.slice(0, 7) === thisYM
        );
        const spent = thisMonthItems.reduce((sum, item) => sum + item.amount, 0);
        console.log('[Analytics] 이번 달 지출:', spent);
        setTotalExpense(spent);

        // 이번 달 상위 5개 결제명
        const groupedMap: Record<string, number> = {};
        thisMonthItems.forEach(item => {
          const key = item.title || '기타';
          groupedMap[key] = (groupedMap[key] ?? 0) + item.amount;
        });
        const top5 = Object.entries(groupedMap)
          .map(([label, value]) => ({ label, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        console.log('[Analytics] top5:', top5);
        const top5Total = top5.reduce((sum, item) => sum + item.value, 0);
        setTopSpendingTotal(top5Total);
        setTopSpendingItems(
          top5.map((item, index) => ({
            label: item.label,
            value: item.value,
            color: TOP_SPENDING_COLORS[index] ?? '#CBD5E1',
          }))
        );

        // 최근 6개월 월별 그룹핑
        const recentItems = allItems.filter(item =>
          recentMonthsSet.has(item.transactionDate?.slice(0, 7))
        );
        const groupedByMonth: Record<string, number> = {};
        recentItems.forEach(item => {
          const ym = item.transactionDate.slice(0, 7);
          groupedByMonth[ym] = (groupedByMonth[ym] ?? 0) + item.amount;
        });
        console.log('[Analytics] groupedByMonth:', groupedByMonth);
        const finalMonthly: MonthlyExpense[] = recentMonths.map(ym => ({
          month: `${parseInt(ym.split('-')[1], 10)}월`,
          amount: groupedByMonth[ym] ?? 0,
        }));
        console.log('[Analytics] finalMonthly:', finalMonthly);
        setMonthlyData(finalMonthly);
      } catch (error: any) {
        console.error('[Analytics] transactions fetch failed:', error?.response?.status, error?.response?.data);
        setFetchError('데이터를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [groupId]);

  return (
    <ScreenLayout>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>지출 분석</Text>
            <Text style={styles.headerSub}>{groupName}</Text>
          </View>

          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.closeText}>닫기</Text>
          </Pressable>
        </View>

        {isLoading && (
          <ActivityIndicator size="large" color={COLORS.brand} style={styles.loader} />
        )}

        {fetchError && !isLoading && (
          <Text style={styles.errorText}>{fetchError}</Text>
        )}

        <View style={styles.statRow}>
          <StatCard label="총지출" value={`${totalExpense.toLocaleString()}원`} />
          <StatCard label="총입금" value={`${totalIncome.toLocaleString()}원`} />
          <StatCard label="현재 잔액" value={`${currentBalance.toLocaleString()}원`} />
        </View>

        <View style={styles.cardWrap}>
          <BudgetGaugeCard
            budget={monthlyBudget}
            spent={totalExpense}
          />
        </View>

        <View style={styles.cardWrap}>
          <ExpenseCategoryCard
            totalExpense={topSpendingTotal}
            categories={topSpendingItems}
          />
        </View>

        <MonthlyTrendCard data={monthlyData} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
  loader: {
    marginVertical: 32,
  },
  errorText: {
    marginVertical: 16,
    textAlign: 'center',
    fontSize: 14,
    color: '#EF4444',
    fontFamily: FONT_FAMILY.medium,
  },
  cardWrap: {
    marginBottom: 16,
  },

  headerRow: {
    marginTop: 6,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },
  headerSub: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },
  closeText: {
    fontSize: 14,
    color: COLORS.brand,
    fontFamily: FONT_FAMILY.medium,
  },

  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 16,
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },
});
