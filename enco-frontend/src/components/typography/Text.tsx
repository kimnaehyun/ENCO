// Text.tsx
// 타이포그래피 시스템의 핵심 컴포넌트
// 모든 wrapper/role 컴포넌트는 이 컴포넌트를 기반으로 함

import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { TYPOGRAPHY, COLORS, Variant, Color, ColorValue } from './typography';

export interface CustomTextProps extends TextProps {
  /** 타이포그래피 토큰 (h1 | h2 | body | caption) */
  variant?: Variant;
  /**
   * 색상 토큰 또는 hex 직접 입력 모두 허용
   * - 토큰: 'primary' | 'secondary' | 'disabled' | 'white' | 'danger'
   * - hex: '#FF0000' 등 직접 입력 (escape hatch)
   */
  color?: Color | ColorValue;
  /** 텍스트 정렬 */
  align?: TextStyle['textAlign'];
}

const Text = ({
  variant = 'body',
  color = 'primary',
  align,
  style,
  ...props
}: CustomTextProps) => {
  const typoStyle = TYPOGRAPHY[variant];

  return (
    <RNText
      style={[
        typoStyle,
        { color: COLORS[color as Color] ?? color },
        align && { textAlign: align },
        style,
      ]}
      {...props}
    />
  );
};

export default Text;
