import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native'
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';;
import PieChart, { PieSlice } from '../charts/PieChart';

type PaymentStatusCardProps = {
  paidCount: number;
  unpaidCount: number;
  onPress?: () => void;
  height?: number;
};

export default function PaymentStatusCard({
  paidCount,
  unpaidCount,
  onPress,
  height = 320,
}: PaymentStatusCardProps) {
  const pieSlices: PieSlice[] = [
    { value: paidCount, color: '#818CF8' },
    { value: unpaidCount, color: '#86EFAC' },
  ];

  return (
    <Pressable onPress={onPress} style={[styles.card, { height }]}>
      <Text style={styles.title}>이달의 납부 현황</Text>

      <View style={styles.chartRow}>
        <View style={styles.sideBox}>
          <Text style={styles.sideLabel}>미납 인원</Text>
          <Text style={[styles.sideValue, { color: COLORS.success }]}>
            {unpaidCount}명
          </Text>
        </View>

        <PieChart slices={pieSlices} size={150} />

        <View style={[styles.sideBox, styles.rightBox]}>
          <Text style={styles.sideLabel}>납부 인원</Text>
          <Text style={[styles.sideValue, { color: '#818CF8' }]}>
            {paidCount}명
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
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
  title: {
    fontSize: 14,
    color: COLORS.subtle,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 4,
  },
  chartRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideBox: {
    width: 64,
    alignItems: 'flex-start',
    gap: 4,
  },
  rightBox: {
    alignItems: 'flex-end',
  },
  sideLabel: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    textAlign: 'center',
  },
  sideValue: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
  },
});