import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';
import Svg, { Circle, Line, Path } from 'react-native-svg';

export type MonthlyExpense = {
  month: string;
  amount: number;
};

type MonthlyTrendCardProps = {
  title?: string;
  description?: string;
  data: MonthlyExpense[];
  onPress?: () => void;
  height?: number;
};

function AreaTrendChart({ data }: { data: MonthlyExpense[] }) {
  if (data.length < 2) return null;

  const width = 300;
  const height = 145;
  const padding = 16;

  const values = data.map(d => d.amount);
  const maxValue = Math.max(...values, 1);

  const points = data.map((item, index) => {
    const x = padding + (index * (width - padding * 2)) / (data.length - 1);
    const y =
      height - padding - (item.amount / maxValue) * (height - padding * 2);
    return { x, y };
  });

  const linePath = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    height - padding
  } L ${points[0].x} ${height - padding} Z`;

  return (
    <View className="mt-1.5">
      <Svg width={width} height={height}>
        <Line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#D1D5DB"
          strokeWidth="1"
        />
        <Path d={areaPath} fill="#DBEAFE" />
        <Path d={linePath} stroke="#1428A0" strokeWidth="3" fill="none" />
        {points.map((p, idx) => (
          <Circle key={idx} cx={p.x} cy={p.y} r="4" fill="#1428A0" />
        ))}
      </Svg>

      <View style={styles.axisLabelRow}>
        {data.map(item => (
          <Text key={item.month} style={styles.axisLabel}>
            {item.month}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function MonthlyTrendCard({
  title = '월별 지출 추이',
  description = '최근 6개월 기준 지출 흐름을 보여줍니다.',
  data,
  onPress,
  height = 320,
}: MonthlyTrendCardProps) {
  const validMonthCount = data.filter(d => d.amount > 0).length;
  const hasNoData = data.length === 0 || validMonthCount === 0;
  const hasInsufficientData = !hasNoData && validMonthCount <= 1;

  const displayDescription = hasNoData
    ? '최근 6개월 지출 데이터가 없습니다.'
    : hasInsufficientData
      ? '월별 추이를 보기엔 데이터가 부족합니다.'
      : description;

  return (
    <Pressable onPress={onPress} style={[styles.sectionCard, { height }]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.cardDesc} numberOfLines={2}>
        {displayDescription}
      </Text>
      {hasNoData ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>지출 내역이 없습니다.</Text>
        </View>
      ) : hasInsufficientData ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>
            추이를 보기엔 데이터가 부족합니다.
          </Text>
        </View>
      ) : (
        <AreaTrendChart data={data} />
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
  cardDesc: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    lineHeight: 18,
    marginTop: 6,
  },
  axisLabelRow: {
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  axisLabel: {
    fontSize: 11,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
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
