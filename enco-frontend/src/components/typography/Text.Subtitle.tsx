// Text.Subtitle.tsx
// h2 variant 래퍼 — 섹션 제목, 카드 타이틀 등에 사용

import React from 'react';
import Text from './Text';
import { CustomTextProps } from './Text';

type SubtitleProps = Omit<CustomTextProps, 'variant'>;

const Subtitle = (props: SubtitleProps) => {
  return <Text variant="h2" {...props} />;
};

export default Subtitle;
