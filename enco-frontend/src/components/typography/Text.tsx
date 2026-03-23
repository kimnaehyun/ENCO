// Text.tsx
// 타이포그래피 시스템의 핵심 컴포넌트
// 모든 wrapper/role 컴포넌트는 이 컴포넌트를 기반으로 함

import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import {
  TYPOGRAPHY,
  COLORS,
  FONT_FAMILY,
  Variant,
  Color,
  ColorValue,
  Weight,
} from './typography';

export interface CustomTextProps extends TextProps {
  /** 타이포그래피 토큰 (h1 | h2 | body | caption) */
  variant?: Variant;
  /**
   * 폰트 굵기 토큰 (light | medium | bold)
   * - 생략 시 variant별 기본값 자동 적용
   *   - h1, h2 → bold
   *   - body, caption → medium
   * - 명시하면 기본값 override 가능
   *   예: <Text variant="body" weight="bold">굵은 본문</Text>
   */
  weight?: Weight;
  /**
   * 색상 토큰 또는 임의의 색상값 모두 허용
   * - 토큰: 'primary' | 'secondary' | 'disabled' | 'white' | 'danger'
   * - escape hatch: '#3B82F6', 'rgba(0,0,0,0.5)' 등 직접 입력
   */
  color?: Color | ColorValue;
  /** 텍스트 정렬 */
  align?: TextStyle['textAlign'];
  /**
   * 스크린 리더가 해당 요소의 역할을 인식하는 데 사용
   * - Title/Subtitle: 'header' 자동 주입
   * - 일반 텍스트: 생략 가능 (기본값 'text')
   */
  accessibilityRole?: TextProps['accessibilityRole'];
  /**
   * 스크린 리더가 변경 사항을 읽어주는 방식
   * - ErrorText: 'assertive' 자동 주입 (즉시 읽음)
   * - HelperText: 'polite' 자동 주입 (순서대로 읽음)
   */
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
}

const Text = ({
  variant = 'body',
  weight,
  color = 'primary',
  align,
  style,
  ...props
}: CustomTextProps) => {
  const typoStyle = TYPOGRAPHY[variant];

  // variant별 기본 weight
  // h1, h2는 항상 bold / body, caption은 medium
  // weight prop으로 명시하면 override 가능
  const defaultWeight: Weight =
    variant === 'h1' || variant === 'h2' ? 'bold' : 'medium';

  const resolvedWeight = weight ?? defaultWeight;

  return (
    <RNText
      style={[
        typoStyle,
        { fontFamily: FONT_FAMILY[resolvedWeight] },
        { color: COLORS[color as Color] ?? color },
        align && { textAlign: align },
        style,
      ]}
      {...props}
    />
  );
};

export default Text;
