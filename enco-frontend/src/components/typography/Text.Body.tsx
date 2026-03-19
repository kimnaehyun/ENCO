// Text.Body.tsx
// body variant 래퍼 — 본문, 일반 텍스트에 사용

import React from 'react';
import Text from './Text';
import { CustomTextProps } from './Text';

type BodyProps = Omit<CustomTextProps, 'variant'>;

const Body = (props: BodyProps) => {
  return <Text variant="body" {...props} />;
};

export default Body;
