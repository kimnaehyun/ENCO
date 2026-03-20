import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

type BudgetGaugeCardProps = {
  title?: string;
  budget: number;
  spent: number;
  onPress?: () => void;
  height?: number;
};

const formatKRW = (n: number) => `${n.toLocaleString()}원`;

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export default function BudgetGaugeCard({
  title = '예산 대비 소진율',
  budget,
  spent,
  onPress,
  height = 320,
}: BudgetGaugeCardProps) {
  const percent = budget > 0 ? Math.min(spent / budget, 1.2) : 0;
  const displayPercent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const clampedPercent = Math.min(percent, 1);

  const remain = Math.max(budget - spent, 0);
  const overBudget = spent > budget;

  const width = 300;
  const chartHeight = 170;
  const cx = width / 2;
  const cy = 130;
  const radius = 82;

  const startAngle = 270;
  const endAngle = 270 + 180 * clampedPercent;

  const backgroundArc = useMemo(
    () => describeArc(cx, cy, radius, 270, 450),
    [cx, cy, radius]
  );

  const valueArc = useMemo(() => {
    if (clampedPercent <= 0) return '';
    return describeArc(cx, cy, radius, startAngle, endAngle);
  }, [cx, cy, radius, startAngle, endAngle, clampedPercent]);

  const progressTone =
    displayPercent >= 100
      ? styles.overText
      : displayPercent >= 80
      ? styles.warnText
      : styles.safeText;

  return (
    <Pressable onPress={onPress} style={[styles.card, { height }]}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.chartWrap}>
        <Svg width={width} height={chartHeight}>
          <Defs>
            <LinearGradient id="budgetSafe" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#6366F1" />
              <Stop offset="100%" stopColor="#38BDF8" />
            </LinearGradient>

            <LinearGradient id="budgetWarn" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#FB923C" />
              <Stop offset="100%" stopColor="#F43F5E" />
            </LinearGradient>
          </Defs>

          <Path
            d={backgroundArc}
            stroke="#EEF2FF"
            strokeWidth={18}
            fill="none"
            strokeLinecap="round"
          />

          {valueArc ? (
            <Path
              d={valueArc}
              stroke={displayPercent >= 80 ? 'url(#budgetWarn)' : 'url(#budgetSafe)'}
              strokeWidth={18}
              fill="none"
              strokeLinecap="round"
            />
          ) : null}
        </Svg>

        <View style={styles.centerTextWrap}>
          <Text style={styles.centerLabel}>이번 달 사용</Text>
          <Text style={styles.centerValue}>{formatKRW(spent)}</Text>
          <Text style={[styles.centerPercent, progressTone]}>
            {displayPercent}%
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>설정 예산</Text>
          <Text style={styles.infoValue}>{formatKRW(budget)}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>
            {overBudget ? '초과 금액' : '남은 예산'}
          </Text>
          <Text
            style={[
              styles.infoValue,
              overBudget ? styles.overText : styles.safeText,
            ]}
          >
            {formatKRW(overBudget ? spent - budget : remain)}
          </Text>
        </View>
      </View>

      <Text style={styles.helperText} numberOfLines={2}>
        {displayPercent >= 100
          ? '이번 달 예산을 초과했어요.'
          : displayPercent >= 80
          ? '예산 소진율이 높아요. 지출을 점검해보세요.'
          : '예산 범위 안에서 안정적으로 사용 중이에요.'}
      </Text>
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
    fontSize: 16,
    color: '#111827',
    fontFamily: 'GmarketSansTTFBold',
  },
  chartWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  centerTextWrap: {
    position: 'absolute',
    top: 72,
    alignItems: 'center',
  },
  centerLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFMedium',
    marginBottom: 4,
  },
  centerValue: {
    fontSize: 22,
    color: '#111827',
    fontFamily: 'GmarketSansTTFBold',
  },
  centerPercent: {
    marginTop: 4,
    fontSize: 16,
    fontFamily: 'GmarketSansTTFBold',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFMedium',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 15,
    color: '#111827',
    fontFamily: 'GmarketSansTTFBold',
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFMedium',
  },
  safeText: {
    color: '#1428A0',
  },
  warnText: {
    color: '#D97706',
  },
  overText: {
    color: '#DC2626',
  },
});