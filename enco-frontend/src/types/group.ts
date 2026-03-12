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

type LedgerItem = {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // + / -
  title: string;
  memo?: string;
  hasReceipt?: boolean;
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
  GroupPayStep,
  Message,
};
