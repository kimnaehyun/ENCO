// Example.tsx
// 타이포그래피 시스템 사용 예시

import React from 'react';
import { View } from 'react-native';

// 방법 1: namespace 방식 (추천)
import Text from '@/components/typography';

// 방법 2: named import 방식
import { Title, ErrorText, Label, HelperText } from '@/components/typography';

const Example = () => {
  return (
    <View>
      {/* === Wrapper 컴포넌트 === */}
      <Text.Title>화면 제목</Text.Title>
      <Text.Subtitle>섹션 제목</Text.Subtitle>
      <Text.Body>본문 텍스트입니다.</Text.Body>
      <Text.Caption>작은 보조 설명</Text.Caption>

      {/* === Role 기반 컴포넌트 === */}
      <Text.Label>이메일</Text.Label>
      <Text.Helper>올바른 이메일 형식으로 입력해주세요.</Text.Helper>
      <Text.Error>이메일 형식이 올바르지 않습니다.</Text.Error>
      <Text.Button>로그인</Text.Button>

      {/* === Core Text (variant 직접 사용) === */}
      <Text variant="h1">큰 제목</Text>
      <Text variant="body" color="secondary">흐린 본문</Text>
      <Text variant="caption" align="center">가운데 정렬 캡션</Text>

      {/* === color escape hatch (hex 직접 사용) === */}
      <Text color="#3B82F6">커스텀 파란색</Text>

      {/* === named import 방식 === */}
      <Title>제목</Title>
      <ErrorText>에러 메시지</ErrorText>
      <Label>라벨</Label>
      <HelperText>도움말</HelperText>
    </View>
  );
};

export default Example;
