// typography.ts
// 디자인 시스템의 핵심 토큰 정의
// 이 파일의 값을 변경하면 앱 전체에 자동 반영됨

export const FONT_FAMILY = {
  light: 'GmarketSansTTFLight',
  medium: 'GmarketSansTTFMedium',
  bold: 'GmarketSansTTFBold',
} as const;

export const COLORS = {
  primary: '#111111',
  secondary: '#666666',
  disabled: '#AAAAAA',
  white: '#FFFFFF',
  danger: '#FF3B30',
} as const;

export const TYPOGRAPHY = {
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: FONT_FAMILY.bold,
  },
  h2: {
    fontSize: 22,
    lineHeight: 30,
    fontFamily: FONT_FAMILY.bold,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: FONT_FAMILY.medium,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: FONT_FAMILY.light,
  },
} as const;

export type Variant = keyof typeof TYPOGRAPHY;
export type Color = keyof typeof COLORS;
export type ColorValue = (typeof COLORS)[Color];
