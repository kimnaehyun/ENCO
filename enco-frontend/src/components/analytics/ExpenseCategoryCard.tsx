import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native'
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';;
import PieChart, { PieSlice } from '../../components/charts/PieChart';

export type ExpenseCategoryItem = {
  label: string;
  value: number;
  color: string;
};

type ExpenseCategoryCardProps = {
  title?: string;
  totalExpense: number;
  categories: ExpenseCategoryItem[];
  onPress?: () => void;
  height?: number;
};

export default function ExpenseCategoryCard({
  title = '이번 달 지출 상위 TOP 5',
  totalExpense,
  categories,
  onPress,
  height = 320,
}: ExpenseCategoryCardProps) {
  const pieSlices: PieSlice[] = categories.map(item => ({
    value: item.value,
    color: item.color,
  }));

  const hasData = categories.length > 0 && totalExpense > 0;

  return (
    <Pressable onPress={onPress} style={[styles.sectionCard, { height }]}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {!hasData ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>이번 달 지출 내역이 없습니다.</Text>
        </View>
      ) : (
        <View style={styles.pieSection}>
          <View style={styles.pieCenterWrap}>
            <PieChart slices={pieSlices} size={150} />
          </View>

          <View style={styles.legendWrap}>
            {categories.map(item => (
              <View key={item.label} style={styles.legendRow}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: item.color },
                  ]}
                />
                <Text style={styles.legendLabel}>{item.label}</Text>
                <Text style={styles.legendValue}>
                  {totalExpense > 0
                    ? `${Math.round((item.value / totalExpense) * 100)}%`
                    : '0%'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },
  pieSection: {
    flex: 1,
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pieCenterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendWrap: {
    width: '100%',
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.subtle,
    fontFamily: FONT_FAMILY.medium,
  },
  legendValue: {
    fontSize: 14,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.subtle,
    fontFamily: FONT_FAMILY.medium,
  },
});