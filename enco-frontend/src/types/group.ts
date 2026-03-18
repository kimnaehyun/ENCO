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
  PaymentSuccess:
    | {
        amount?: number;
        callbackUrl?: string;
        orderId?: string;
      }
    | undefined;
};

// Group
// GroupStackParamList에 아래 항목들 추가
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
  AdminSendAlert: CommonParams | undefined;
  AdminCard:
    | (CommonParams & {
        selectedCardId?: string;
        selectedCardImage?: string;
        selectedCardName?: string;
        selectedTags?: string[];
        recommendPressed?: boolean;
        viewAllPressed?: boolean;
      })
    | undefined;
  AdminCardRecommend: {
    groupId?: string;
    groupName: string;
    tags: string[];
    prevTags?: string[];
    prevRecommendPressed?: boolean;
    prevViewAllPressed?: boolean;
  };
  AdminCardPin: {
    groupId?: string;
    groupName: string;
    tags: string[];
    selectedCardId: string;
    selectedCardName?: string | null;
  };
  AdminCardDone: {
    groupId?: string;
    groupName?: string;
    selectedCardId?: string;
  };
  AdminSettle: CommonParams | undefined;
  GroupVoteDetail: { voteId: string } & CommonParams;
  VoteCreate: CommonParams | undefined;
  //나중에 딥링크 연걸 후 객체 타입으로 변경 예정
  GroupInviteEntry: undefined;
  GroupInviteDecision: undefined;
  GroupInviteSuccess: undefined;

  GroupCreate:
    | {
        selectedCardId?: string;
        selectedCardImage?: string;
        selectedCardName?: string;
        groupName?: string;
        selectedTags?: string[];
        recommendPressed?: boolean;
        viewAllPressed?: boolean;
      }
    | undefined;
  GroupCardRecommend: {
    groupName: string;
    address: string;
    tags: string[];
    prevGroupName?: string;
    prevTags?: string[];
    prevRecommendPressed?: boolean;
    prevViewAllPressed?: boolean;
  };
  GroupPinSetup: {
    groupName: string;
    address: string;
    tags: string[];
    selectedCardId: string;
  };
  UserNotifications: CommonParams | undefined;
  GroupLedgerDetail: {
    item: any; // LedgerItem import 후 교체
    balance: number;
    isAdmin: boolean;
    groupName: string;
  };
  OcrTest:
    | { imageUri?: string; groupName?: string; groupId?: string }
    | undefined;
  SettleDetail: {
    amount: number;
    storeName: string;
    date: string;
    memo: string;
    receiptUri: string | null;
    groupName: string;
    groupId?: string;
  };
  SettleMemberSelect: {
    amount: number;
    storeName: string;
    date: string;
    memo: string;
    receiptUri: string | null;
    groupName: string;
    groupId?: string;
    settleMembers?: any[];
    isNewSettle?: boolean;
  };
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
  VoteCreate: CommonParams | undefined;
  AdminMenu: CommonParams | undefined;
  AdminReceipt: CommonParams | undefined;
  AdminMembers: CommonParams | undefined;
  AdminSendAlert: CommonParams | undefined;
  AdminCard:
    | (CommonParams & {
        selectedCardId?: string;
        selectedCardImage?: string;
        selectedCardName?: string;
        selectedTags?: string[];
        recommendPressed?: boolean;
        viewAllPressed?: boolean;
      })
    | undefined;
  AdminCardRecommend: {
    groupId?: string;
    groupName: string;
    tags: string[];
    prevTags?: string[];
    prevRecommendPressed?: boolean;
    prevViewAllPressed?: boolean;
  };
  AdminCardPin: {
    groupId?: string;
    groupName: string;
    tags: string[];
    selectedCardId: string;
    selectedCardName?: string | null;
  };
  AdminCardDone: {
    groupId?: string;
    groupName?: string;
    selectedCardId?: string;
  };
  AdminSettle: CommonParams | undefined;
  GroupInviteEntry: undefined;
  GroupInviteDecision: undefined;
  GroupInviteSuccess: undefined;
  OcrTest:
    | { imageUri?: string; groupName?: string; groupId?: string }
    | undefined;
  GroupLedgerDetail: {
    item: any;
    balance: number;
    isAdmin: boolean;
    groupName: string;
  };
  SettleDetail: {
    amount: number;
    storeName: string;
    date: string;
    memo: string;
    receiptUri: string | null;
    groupName: string;
    groupId?: string;
  };
  SettleMemberSelect: {
    amount: number;
    storeName: string;
    date: string;
    memo: string;
    receiptUri: string | null;
    groupName: string;
    groupId?: string;
    settleMembers?: any[];
    isNewSettle?: boolean;
  };
  UserNotifications: CommonParams | undefined;
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
  GroupCreate:
    | {
        selectedCardId?: string;
        selectedCardImage?: string;
        selectedCardName?: string;
        groupName?: string;
        selectedTags?: string[];
        recommendPressed?: boolean;
        viewAllPressed?: boolean;
      }
    | undefined;
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

export type Message = {
  id: string;
  messageType: string;
  roomId: string;
  senderId: number;
  content: string;
  metadata: null;
  createdAt: string;
  status?: 'sending' | 'sent' | 'failed';
};
