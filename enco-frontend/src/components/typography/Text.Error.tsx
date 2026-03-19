// Text.Error.tsx
// 에러 상태 텍스트 — 유효성 검사 실패, 에러 메시지에 사용
//
// 디자인 규칙:
// - variant: caption
// - color: danger (#FF3B30)
//
// Note:
// HelperText, Label과 현재 variant가 동일하지만,
// 향후 애니메이션(shake 등), 아이콘 추가, 색상 변경 가능성 있어 별도 유지

import React from 'react';
import Text from './Text';
import { CustomTextProps } from './Text';

const ErrorText = (props: CustomTextProps) => {
  return <Text variant="caption" color="danger" {...props} />;
};

export default ErrorText;
