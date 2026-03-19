// Text.Title.tsx
// h1 variant 래퍼 — 화면 대제목에 사용

import React from 'react';
import Text from './Text';
import { CustomTextProps } from './Text';

type TitleProps = Omit<CustomTextProps, 'variant'>;

const Title = (props: TitleProps) => {
  return <Text variant="h1" {...props} />;
};

export default Title;
