// Text.Caption.tsx
// caption variant 래퍼 — 작은 보조 텍스트에 사용

import React from 'react';
import Text from './Text';
import { CustomTextProps } from './Text';

type CaptionProps = Omit<CustomTextProps, 'variant'>;

const Caption = (props: CaptionProps) => {
  return <Text variant="caption" {...props} />;
};

export default Caption;
