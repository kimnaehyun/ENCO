import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
};

export default function ExpenseCategoryCard({
  title = '카테고리별 지출 비율',
  totalExpense,
  categories,
}: ExpenseCategoryCardProps) {
  const pieSlices: PieSlice[] = categories.map(item => ({
    value: item.value,
    color: item.color,
  }));

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.pieSection}>
        <View style={styles.pieCenterWrap}>
          <PieChart slices={pieSlices} size={160} />
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
                {Math.round((item.value / totalExpense) * 100)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'GmarketSansTTFBold',
    marginBottom: 10,
  },
  pieSection: {
    marginTop: 10,
    alignItems: 'center',
  },
  pieCenterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendWrap: {
    width: '100%',
    marginTop: 18,
    gap: 10,
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
    color: '#374151',
    fontFamily: 'GmarketSansTTFMedium',
  },
  legendValue: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'GmarketSansTTFBold',
  },
});