import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native'
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';;
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

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
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

  const groupName = params.groupName ?? '모임명';

  const totalExpense = 428000;
  const totalIncome = 600000;
  const currentBalance = 172000;
  const monthlyBudget = 500000;

  const categoryData = useMemo<ExpenseCategoryItem[]>(
    () => [
      { label: '식비', value: 180000, color: COLORS.brand },
      { label: '유흥', value: 90000, color: '#60A5FA' },
      { label: '회비 적립', value: 110000, color: '#818CF8' },
      { label: '기타', value: 48000, color: '#C7D2FE' },
    ],
    []
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
    []
  );

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
            totalExpense={totalExpense}
            categories={categoryData}
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