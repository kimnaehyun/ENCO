import { RouteProp } from '@react-navigation/native';
import { GroupStackParamList, RootStackParamList } from './navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type CardRecommendRouteProp = RouteProp<
  RootStackParamList,
  'GroupCardRecommend'
>;

type GroupCardItem = {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  summary: string;
  detail: string;
};

type GroupProps<T extends keyof GroupStackParamList> = NativeStackScreenProps<
  GroupStackParamList,
  T
>;

type SettleMember = {
  id: string;
  name: string;
  isPaid: boolean;
};

type LedgerItem = {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // + / -
  title: string;
  memo?: string;
  hasReceipt?: boolean;
  needsSettle?: boolean; // 출금 중 정산 필요 여부 (true: 정산필요O, false: 정산필요X)
  isSettled?: boolean; // 정산완료 여부
  settleMembers?: SettleMember[]; // 정산 대상 멤버
};

type GroupPayStep = 'summary' | 'form' | 'pin' | 'success';

type Message = {
  id: number;
  content: string;
  host: string;
  created_at: string;
};

export type {
  CardRecommendRouteProp,
  GroupCardItem,
  GroupProps,
  LedgerItem,
  SettleMember,
  GroupPayStep,
  Message,
};