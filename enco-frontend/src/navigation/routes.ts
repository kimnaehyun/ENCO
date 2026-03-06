// src/navigation/routes.ts

export const ROUTES = {
  // Bottom Tabs (✅ 기존 Tab name 문자열 유지)
  TAB_HOME: 'Home', // 홈
  TAB_GROUP: 'Together', // 모임(=모임목록 탭)
  TAB_PAYMENT: 'Account', // 결제

  // Group Stack Screens (✅ 모임 탭 내부에서 push될 화면들)
  GROUP_LIST: 'GroupList', // 모임 목록 (TogetherScreen)
  GROUP_DASHBOARD: 'GroupDashboard', // 모임 대시보드
  GROUP_INFO: 'GroupInfo', // 모임 정보(placeholder)
  GROUP_VOTES: 'GroupVotes', // 투표 목록(placeholder)
  GROUP_VOTE_DETAIL: 'GroupVoteDetail',                                                                                                                                       
  GROUP_PAY: 'GroupPay', // 납부(placeholder)
  GROUP_CHAT: 'GroupChat', // 커뮤니티/톡방(placeholder)

  // Payment Stack Screens (나중에 확장용)
  PAYMENT_MAIN: 'PAYMENT_MAIN',
  PAYMENT_HISTORY: 'PAYMENT_HISTORY',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];