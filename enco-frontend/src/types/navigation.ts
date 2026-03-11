import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { CommonParams } from "./common";

// ─── Auth ────────────────────────────────────────────────────────────────────
type AuthStackParamList = {
  AuthLanding: undefined;
  Login: undefined;
  SignupForm: undefined;
  SignupPinSetup: {
    name: string;
    birth: string;
    phone: string;
    email: string;
  };
};

// ─── Internet Payment Stack ──────────────────────────────────────────────────
type InternetPayStackParamList = {
  CreateInternetPaymentRequest: undefined;
  PaymentApprovalPending: undefined;
  InternetPaymentPin: { screen?: string } | undefined;
  PaymentSuccess: {
    amount?: number;
    callbackUrl?: string;
    orderId?: string;
  } | undefined;
};

// ─── Root ─────────────────────────────────────────────────────────────────────
type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined;

  GroupCreate: undefined;
  GroupCardRecommend: {
    groupName: string;
    address: string;
    tags: string[];
  };
  GroupPinSetup: {
    groupName: string;
    address: string;
    tags: string[];
    selectedCardId: string;
  };

  InternetPayFlow: NavigatorScreenParams<InternetPayStackParamList>;
};

// ─── Bottom Tab ───────────────────────────────────────────────────────────────
type BottomTabParamList = {
  Account: undefined;
  HomeTab: undefined;
  Together: NavigatorScreenParams<GroupStackParamList>;
};

// ─── Group Stack ──────────────────────────────────────────────────────────────
type GroupStackParamList = {
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

// ─── Home Stack ───────────────────────────────────────────────────────────────
type HomeStackParamList = {
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
};

// ─── Screen Props ─────────────────────────────────────────────────────────────
type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

type GroupScreenProps<T extends keyof GroupStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<GroupStackParamList, T>,
  BottomTabScreenProps<BottomTabParamList>
>;

export type {
  AuthStackParamList,
  RootStackParamList,
  BottomTabParamList,
  AuthScreenProps,
  RootScreenProps,
  GroupStackParamList,
  GroupScreenProps,
  HomeStackParamList,
  InternetPayStackParamList,
};