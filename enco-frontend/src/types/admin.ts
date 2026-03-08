type AdminCard = {
  id: string;
  name: string;
  short: string;
  recommendedFor: string[]; // 태그
  benefits: string[];
};

type AdminStep = 'main' | 'list' | 'detail' | 'pin' | 'done';

type AdminMember = {
  id: string;
  name: string;
  joinedAt: string; // YYYY-MM-DD
  memo?: string;
};

type AdminMenuItem = {
  key: string;
  title: string;
  onPress: () => void;
};

type AdminMemberPay = {
  id: string;
  name: string;
  joinedAt: string; // 가입일(임시)
  memo?: string;
  isPaid: boolean;
  dueAmount: number; // 회비(임시)
};

export type {AdminCard, AdminStep, AdminMember, AdminMenuItem, AdminMemberPay}