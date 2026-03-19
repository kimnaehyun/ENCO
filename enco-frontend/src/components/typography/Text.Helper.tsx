// Text.Helper.tsx
// Input 하단 도움말 텍스트 — 입력 가이드, 힌트 메시지에 사용
//
// 디자인 규칙:
// - variant: caption
// - color: secondary (#666666)
//
// Note:
// Label과 현재 스타일 동일하지만 역할이 다름 (입력을 돕는 "설명")
// 향후 lineHeight 증가, marginTop 추가 가능성 있어 별도 유지

import React from 'react';
import Text from './Text';
import { CustomTextProps } from './Text';

const HelperText = (props: CustomTextProps) => {
  return <Text variant="caption" color="secondary" {...props} />;
};

export default HelperText;
