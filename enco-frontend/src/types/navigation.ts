import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { CommonParams } from './common';

// Auth
export type AuthStackParamList = {
  AuthLanding: undefined;
  Login: undefined;

  SignupVerify: undefined;
  InputInfo: undefined;

  SignupPinSetup: {
    name: string;
    birth: string;
    phone: string;
    email: string;
  };

  SignupComplete: undefined;
};

// Internet Payment
export type InternetPayStackParamList = {
  CreateInternetPaymentRequest: undefined;
  PaymentApprovalPending: undefined;
  InternetPaymentPin: { screen?: string } | undefined;
  PaymentSuccess: {
    amount?: number;
    callbackUrl?: string;
    orderId?: string;
  } | undefined;
};

// Group
export type GroupStackParamList = {
  GroupList: undefined;
  GroupDashboard: (CommonParams & { selectedCard?: string }) | undefined;
  GroupInfo: CommonParams | undefined;
  GroupVotes: CommonParams | undefined;
  GroupPay: CommonParams | undefined;
  GroupChat: CommonParams | undefined;
  GroupLedger: CommonParams | undefined;
  AdminMenu: CommonParams | undefined;
  AdminReceipt: CommonParams | undefined;
  AdminMembers: CommonParams | undefined;
  AdminCard: CommonParams | undefined;
  AdminSettle: CommonParams | undefined;
  GroupVoteDetail: { voteId: string } & CommonParams;
  GroupVoteCreate: undefined;
};

// Home
export type HomeStackParamList = {
  Home: undefined;
  GroupDashboard: (CommonParams & { selectedCard?: string }) | undefined;
  GroupInfo: CommonParams | undefined;
  GroupVotes: CommonParams | undefined;
  GroupPay: CommonParams | undefined;
  GroupChat: CommonParams | undefined;
  GroupLedger: CommonParams | undefined;
  GroupVoteDetail: { voteId: string } & CommonParams;
  GroupVoteCreate: undefined;
  AdminMenu: CommonParams | undefined;
  AdminReceipt: CommonParams | undefined;
  AdminMembers: CommonParams | undefined;
  AdminCard: CommonParams | undefined;
  AdminSettle: CommonParams | undefined;
  OcrTest: CommonParams | undefined;
};

// Bottom Tab
export type BottomTabParamList = {
  Account: undefined;
  HomeTab: undefined;
  Together: NavigatorScreenParams<GroupStackParamList>;
};

// Root
export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: undefined;

// GroupCardRecommend 타입
GroupCardRecommend: {
  groupName: string;
  address: string;
  tags: string[];
  prevGroupName?: string;
  prevTags?: string[];
  prevRecommendPressed?: boolean; 
  prevViewAllPressed?: boolean;
};

// GroupCreate 타입
GroupCreate: {
  selectedCardId?: string;
  selectedCardImage?: string;
  selectedCardName?: string;
  groupName?: string;
  selectedTags?: string[];
  recommendPressed?: boolean;  
  viewAllPressed?: boolean;
} | undefined;
  GroupPinSetup: {
    groupName: string;
    address: string;
    tags: string[];
    selectedCardId: string;
  };

  InternetPayFlow: NavigatorScreenParams<InternetPayStackParamList>;
};

// Screen Props
export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type GroupScreenProps<T extends keyof GroupStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<GroupStackParamList, T>,
    BottomTabScreenProps<BottomTabParamList>
  >;

export type SignupStep = 'name' | 'birth' | 'phone' | 'email' | 'done';