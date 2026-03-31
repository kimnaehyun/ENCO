import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  CompositeScreenProps,
  NavigationContainerRef,
  NavigatorScreenParams,
  ParamListBase,
} from '@react-navigation/native';
import { CommonParams } from './common';
import { GroupPayParams, SettleMember } from './group';
import type { ReceiptDraft } from './receipt';

// Auth
export type AuthStackParamList = {
  AuthLanding: undefined;
  Login: undefined;
  ReLogin: undefined;

  SignupVerify: undefined;
  InputInfo: undefined;

  SignupPinSetup: {
    name: string;
    birth: string;
    phone: string;
    email: string;
    gender: 'M' | 'W';
    profileUrl: number;
  };

  SignupComplete: {
    userName: string;
  };
};

// Internet Payment
export type InternetPayStackParamList = {
  CreateInternetPaymentRequest: undefined;
  PaymentApprovalPending: undefined;
  InternetPaymentPin: {
    groupId: number;
    cardId: number;
    title: string;
    description: string;
    storeName: string;
    amount: number;
  };

  PaymentSuccess:
    | {
        amount?: number;
        callbackUrl?: string;
        orderId?: string;
      }
    | undefined;
};

// Group
export type GroupStackParamList = {
  GroupInfo: (CommonParams & { isAdmin?: boolean }) | undefined;
  GroupAnalytics: CommonParams | undefined;
  GroupLedger: (CommonParams & { isAdmin?: boolean }) | undefined;
  GroupList: undefined;
  GroupDashboard: (CommonParams & { selectedCard?: string }) | undefined;
  GroupVotes: CommonParams | undefined;
  GroupPay: GroupPayParams | undefined;
  GroupChat: CommonParams | undefined;
  GroupAttendance: CommonParams | undefined;

  AdminCardPin: {
    groupId?: string;
    groupName: string;
    selectedCardId: string;
  };

  AdminMenu: CommonParams | undefined;
  AdminReceipt: CommonParams | undefined;
  AdminMembers: CommonParams | undefined;
  AdminSendAlert: CommonParams | undefined;
  AdminCard:
    | (CommonParams & {
        accountId?: number;
        selectedCardId?: string;
        selectedCardImage?: string;
        selectedCardBackImage?: string;
        selectedCardName?: string;
        selectedTags?: string[];
        recommendPressed?: boolean;
        viewAllPressed?: boolean;
      })
    | undefined;
  AdminCardRecommend: {
    groupId?: string;
    groupName: string;
    accountId?: number;
    tags: string[];
    prevTags?: string[];
    prevRecommendPressed?: boolean;
    prevViewAllPressed?: boolean;
  };
  AdminCardDone: {
    groupId?: string;
    groupName?: string;
    cardId?: number;
    cardNumber?: string;
    frontImageUrl?: string;
    selectedCardId?: string; // 추가
  };
  AdminSettle: CommonParams | undefined;
  GroupVoteDetail: { voteId: string } & CommonParams;
  VoteCreate: CommonParams | undefined;
  GroupInviteEntry: { inviteToken?: string; groupName?: string } | undefined;
  GroupInviteDecision: { inviteToken?: string; groupName?: string } | undefined;
  GroupInviteSuccess:
    | { groupId?: number | string; groupName?: string }
    | undefined;

  GroupCreate:
    | {
        selectedCardId?: string;
        selectedCardImage?: string;
        selectedCardBackImage?: string;
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
    groupId?: string;
    groupName?: string;
    isAdmin?: boolean;
    transactionId?: number;
    referenceType?: 'TRANSACTION' | 'EXPENSE' | 'POINT';
    pointId?: number;
    listItem?: {
      title: string;
      amount: number;
      transactionDate: string;
      balanceAfter: number;
      type: 'DEPOSIT' | 'WITHDRAW';
      status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
    };
  };
  SettlementReceiptOcr:
    | { imageUri?: string; groupName?: string; groupId?: string }
    | undefined;
  TransactionReceiptOcr:
    | {
        imageUri?: string;
        groupName?: string;
        groupId?: string;
        transactionId: number;
      }
    | undefined;
  SettleDetail: {
    expenseId?: number;
    amount: number;
    storeName: string;
    date: string;
    memo: string;
    receiptUri: string | null;
    groupName: string;
    groupId?: string;
    settleMembers?: SettleMember[];
    isSettled?: boolean;
  };
  SettleMemberSelect: {
    amount: number;
    storeName: string;
    date: string;
    memo: string;
    receiptUri: string | null;
    receiptDraft?: ReceiptDraft | null;
    groupName: string;
    groupId?: string;
    settleMembers?: SettleMember[];
    isNewSettle?: boolean;
    expenseId?: number;
  };
};

// Home
export type HomeStackParamList = {
  GroupInfo: (CommonParams & { isAdmin?: boolean }) | undefined;
  Home: undefined;
  GroupDashboard: (CommonParams & { selectedCard?: string }) | undefined;
  GroupVotes: CommonParams | undefined;
  GroupPay: GroupPayParams | undefined;
  GroupChat: CommonParams | undefined;
  GroupLedger: (CommonParams & { isAdmin?: boolean }) | undefined;
  GroupAttendance: CommonParams | undefined;
  GroupAnalytics: CommonParams | undefined;
  GroupVoteDetail: { voteId: string } & CommonParams;
  VoteCreate: CommonParams | undefined;
  AdminMenu: CommonParams | undefined;
  AdminReceipt: CommonParams | undefined;
  AdminMembers: CommonParams | undefined;
  AdminSendAlert: CommonParams | undefined;
  AdminCard:
    | (CommonParams & {
        accountId?: number;
        selectedCardId?: string;
        selectedCardImage?: string;
        selectedCardBackImage?: string;
        selectedCardName?: string;
        selectedTags?: string[];
        recommendPressed?: boolean;
        viewAllPressed?: boolean;
      })
    | undefined;
  AdminCardRecommend: {
    groupId?: string;
    groupName: string;
    accountId?: number;
    tags: string[];
    prevTags?: string[];
    prevRecommendPressed?: boolean;
    prevViewAllPressed?: boolean;
  };
  AdminCardDone: {
    groupId?: string;
    groupName?: string;
    cardId?: number;
    cardNumber?: string;
    frontImageUrl?: string;
    selectedCardId?: string;
  };
  AdminSettle: CommonParams | undefined;
  GroupInviteEntry: { inviteToken?: string; groupName?: string } | undefined;
  GroupInviteDecision: { inviteToken?: string; groupName?: string } | undefined;
  GroupInviteSuccess:
    | { groupId?: number | string; groupName?: string }
    | undefined;
  SettlementReceiptOcr:
    | { imageUri?: string; groupName?: string; groupId?: string }
    | undefined;
  TransactionReceiptOcr:
    | {
        imageUri?: string;
        groupName?: string;
        groupId?: string;
        transactionId: number;
      }
    | undefined;
  GroupLedgerDetail: {
    groupId?: string;
    groupName?: string;
    isAdmin?: boolean;
    transactionId?: number;
    referenceType?: 'TRANSACTION' | 'EXPENSE' | 'POINT';
    pointId?: number;
    listItem?: {
      title: string;
      amount: number;
      transactionDate: string;
      balanceAfter: number;
      type: 'DEPOSIT' | 'WITHDRAW';
      status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
    };
  };
  SettleDetail: {
    expenseId?: number;
    amount: number;
    storeName: string;
    date: string;
    memo: string;
    receiptUri: string | null;
    groupName: string;
    groupId?: string;
    settleMembers?: SettleMember[];
    isSettled?: boolean;
  };
  SettleMemberSelect: {
    amount: number;
    storeName: string;
    date: string;
    memo: string;
    receiptUri: string | null;
    receiptDraft?: ReceiptDraft | null;
    groupName: string;
    groupId?: string;
    settleMembers?: SettleMember[];
    isNewSettle?: boolean;
    expenseId?: number;
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

  VoteCreateScreen: {
    groupId: number;
    cardId: number;
    amount: number;
    storeName: string;
  };

  CardChoiceScreen: {
    title: string;
    groupId: number;
    amount: number;
    storeName: string;
    callbackUrl: string;
    orderId: string;
  };

  PaymentMethod: {
    title: string;
    groupId: number;
  };

  PaymentSuccess: {
    storeName: string;
    amount: number;
    card?: string;
  };

  SettleMemberSelect: {
    amount: number | null;
    storeName: string;
    date: string;
    memo: string;
    receiptUri: string | null;
    receiptDraft: ReceiptDraft;
    groupName: string;
    groupId?: string;
    isNewSettle: boolean;
  };

  GroupCardRecommend: {
    groupName: string;
    address: string;
    tags: string[];
    prevGroupName?: string;
    prevTags?: string[];
    prevRecommendPressed?: boolean;
    prevViewAllPressed?: boolean;
  };

  GroupCreate:
    | {
        selectedCardId?: string;
        selectedCardImage?: string;
        selectedCardBackImage?: string;
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

export type SignupStep =
  | 'name'
  | 'birth'
  | 'phone'
  | 'email'
  | 'gender'
  | 'profile'
  | 'done';

export type AppNavigationRef = NavigationContainerRef<ParamListBase> | null;
