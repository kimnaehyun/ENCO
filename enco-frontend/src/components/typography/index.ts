// index.ts
// 타이포그래피 시스템 진입점
//
// 사용법 1 (추천) - namespace 방식:
//   import Text from '@/components/typography';
//   <Text.Title>제목</Text.Title>
//   <Text.Error>에러</Text.Error>
//
// 사용법 2 - named import 방식:
//   import { Title, ErrorText } from '@/components/typography';
//   <Title>제목</Title>

import Text from './Text';

import Title from './Text.Title';
import Subtitle from './Text.Subtitle';
import Body from './Text.Body';
import Caption from './Text.Caption';

import ErrorText from './Text.Error';
import Label from './Text.Label';
import HelperText from './Text.Helper';
import ButtonText from './Text.Button';

// Object.assign으로 static property 붙이기
// → TypeScript가 타입 자동 추론 → 자동완성 동작
const TextSystem = Object.assign(Text, {
  Title,
  Subtitle,
  Body,
  Caption,
  Error: ErrorText,
  Label,
  Helper: HelperText,
  Button: ButtonText,
});

export default TextSystem;

// named export (선택적 사용)
export {
  Title,
  Subtitle,
  Body,
  Caption,
  ErrorText,
  Label,
  HelperText,
  ButtonText,
};

// 토큰 re-export (필요한 경우)
export type { Variant, Color, ColorValue } from './typography';
export { FONT_FAMILY, COLORS, TYPOGRAPHY } from './typography';
