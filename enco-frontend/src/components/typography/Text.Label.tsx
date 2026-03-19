// Text.Label.tsx
// Input 상단 라벨 텍스트 — 입력 필드의 이름/역할 표시에 사용
//
// 디자인 규칙:
// - variant: caption
// - color: secondary (#666666)
//
// Note:
// HelperText와 현재 스타일 동일하지만 역할이 다름 (입력 필드의 "이름")
// 향후 fontWeight: medium, marginBottom 추가 가능성 있어 별도 유지

import React from 'react';
import Text from './Text';
import { CustomTextProps } from './Text';

const Label = (props: CustomTextProps) => {
  return <Text variant="caption" color="secondary" {...props} />;
};

export default Label;
