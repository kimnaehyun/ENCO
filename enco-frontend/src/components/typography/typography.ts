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
  muted: '#9CA3AF',
} as const;

export const TYPOGRAPHY = {
  h1: { fontSize: 28, lineHeight: 36 },
  h2: { fontSize: 22, lineHeight: 30 },
  body: { fontSize: 16, lineHeight: 24 },
  bodyLg: { fontSize: 24, lineHeight: 32 },
  caption: { fontSize: 13, lineHeight: 18 },
} as const;

export type Variant = keyof typeof TYPOGRAPHY;
export type Color = keyof typeof COLORS;
export type ColorValue = (typeof COLORS)[Color];
export type Weight = keyof typeof FONT_FAMILY;
