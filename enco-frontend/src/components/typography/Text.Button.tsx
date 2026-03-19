// Text.Button.tsx
// 버튼 내부 텍스트 — Button 컴포넌트 내부에서만 사용
//
// 디자인 규칙:
// - variant: body
// - color: white (#FFFFFF)
//
// Note:
// 버튼 디자인 변경 시 이 컴포넌트만 수정하면 전체 버튼 텍스트 반영됨

import React from 'react';
import Text from './Text';
import { CustomTextProps } from './Text';

const ButtonText = (props: CustomTextProps) => {
  return <Text variant="body" color="white" {...props} />;
};

export default ButtonText;
