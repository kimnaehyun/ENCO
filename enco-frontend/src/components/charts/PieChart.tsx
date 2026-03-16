import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

export interface PieSlice {
  value: number;
  color: string;
}

interface Props {
  slices: PieSlice[];
  size?: number;
}

export default function PieChart({ slices, size = 160 }: Props) {
  const total = slices.reduce((s, i) => s + i.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  let startAngle = -90; // 12시 방향 시작

  const paths = slices.map((slice) => {
    const sweepDeg = (slice.value / total) * 360;
    const endAngle = startAngle + sweepDeg;

    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const largeArc = sweepDeg > 180 ? 1 : 0;

    const d = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    startAngle = endAngle;
    return { d, color: slice.color };
  });

  return (
    <Svg width={size} height={size}>
      <G>
        {paths.map((p, i) => (
          <Path key={i} d={p.d} fill={p.color} />
        ))}
      </G>
    </Svg>
  );
}