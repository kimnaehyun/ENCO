# 프로젝트 생성

npx @react-native-community/cli init 프로젝트명

# 실행 (Android)

npm run android

# 폴더 구조 예시

```
src/
├── assets/ # 이미지, 폰트 등 정적 리소스
├── components/ # 재사용 가능한 공통 UI 컴포넌트
├── screens/ # 페이지 단위 컴포넌트
├── hooks/ # 커스텀 훅
├── navigation/ # 라우팅 관련 설정
├── services/ # API 호출, 외부 라이브러리 연동
├── store/ # 상태 관리 (Zustand, Redux 등)
├── utils/ # 유틸 함수
├── constants/ # 색상, 여백, 공통 스타일 값
└── types/ # 타입스크립트 타입 정의
```

# native wind 설치 가이드

공식 문서대로 진행

## v5 문제

NativeWind v5는 기본적으로 Expo 환경을 기준으로 설계되어서 v5로 여러 가지 설정을 해주는 것 보다 버전을 4로 낮춰서 설정을 해줌

## npm install nativewind react-native-reanimated react-native-safe-area-context

### [Reanimated] `react-native-worklets` library not found.

Reanimated v4부터는 react-native-worklets를 peer dependency로 직접 설치해야 함.

자동 포함 안 됨

```
npm install react-native-worklets
```

## npm install --dev tailwindcss@^3.4.17 prettier-plugin-tailwindcss@^0.5.11

### prettier-plugin-tailwindcss 충돌

prettier-plugin-tailwindcss는 prettier 3 필요

```
npm install --save-dev prettier@^3
```
