// typography.ts
// 디자인 시스템의 핵심 토큰 정의
// 이 파일의 값을 변경하면 앱 전체에 자동 반영됨

export const FONT_FAMILY = {
  light: 'GmarketSansTTFLight',
  medium: 'GmarketSansTTFMedium',
  bold: 'GmarketSansTTFBold',
} as const;

export const COLORS = {
  // 텍스트
  primary:     '#111111',  // 기본 텍스트
  dark:        '#111827',  // 강조 텍스트
  secondary:   '#666666',  // 보조 텍스트
  subtle:      '#374151',  // 중간 강도 텍스트
  muted:       '#6B7280',  // 흐린 텍스트
  placeholder: '#9CA3AF',  // 플레이스홀더/비활성
  disabled:    '#AAAAAA',  // 비활성
  faint:       '#D1D5DB',  // 매우 흐린 텍스트

  // 브랜드
  brand:       '#1428A0',  // 브랜드 컬러 (삼성페이 블루)

  // 상태
  danger:      '#FF3B30',  // 에러 (iOS 기준)
  error:       '#EF4444',  // 에러 (Tailwind 기준)
  warning:     '#F59E0B',  // 경고
  success:     '#22C55E',  // 성공

  // 기타
  white:       '#FFFFFF',
} as const;

export const TYPOGRAPHY = {
  h1:      { fontSize: 28, lineHeight: 36 },
  h2:      { fontSize: 22, lineHeight: 30 },
  bodyLg:  { fontSize: 20, lineHeight: 28 },  // 강조 본문
  body:    { fontSize: 16, lineHeight: 24 },  // 기본 본문
  bodyMd:  { fontSize: 15, lineHeight: 22 },  // 중간 본문
  bodySm:  { fontSize: 14, lineHeight: 20 },  // 작은 본문
  caption: { fontSize: 13, lineHeight: 18 },  // 캡션
  tiny:    { fontSize: 12, lineHeight: 16 },  // 아주 작은 텍스트
  micro:   { fontSize: 11, lineHeight: 15 },  // 최소 텍스트
} as const;

export type Variant = keyof typeof TYPOGRAPHY;
export type Color = keyof typeof COLORS;
export type Weight = keyof typeof FONT_FAMILY;

/**
 * escape hatch 타입 — COLORS 토큰에 없는 임의의 색상값 허용
 * 예: '#3B82F6', 'rgba(0,0,0,0.5)'
 * color prop: Color | ColorValue 형태로 사용
 */
export type ColorValue = string;
