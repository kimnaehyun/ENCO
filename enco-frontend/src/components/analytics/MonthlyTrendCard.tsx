import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

export type MonthlyExpense = {
  month: string;
  amount: number;
};

type MonthlyTrendCardProps = {
  title?: string;
  description?: string;
  data: MonthlyExpense[];
};

function AreaTrendChart({ data }: { data: MonthlyExpense[] }) {
  const width = 300;
  const height = 150;
  const padding = 16;

  const values = data.map(d => d.amount);
  const maxValue = Math.max(...values, 1);

  const points = data.map((item, index) => {
    const x =
      padding +
      (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
    const y =
      height -
      padding -
      (item.amount / maxValue) * (height - padding * 2);
    return { x, y };
  });

  const linePath = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    height - padding
  } L ${points[0].x} ${height - padding} Z`;

  return (
    <View style={{ marginTop: 8 }}>
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
          <Circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#1428A0"
          />
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
}: MonthlyTrendCardProps) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{description}</Text>
      <AreaTrendChart data={data} />
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
  cardDesc: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFMedium',
    lineHeight: 20,
  },
  axisLabelRow: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  axisLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFMedium',
  },
});