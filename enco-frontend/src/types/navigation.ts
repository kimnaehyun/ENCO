import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native";
import { CommonParams } from "./common";

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

type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined;
};

// ✅ 추가
type BottomTabParamList = {
  Account: undefined;
  HomeTab: undefined;
  Together: NavigatorScreenParams<GroupStackParamList>;
};

type GroupStackParamList = {
  GroupList: undefined;
  GroupDashboard: CommonParams | undefined;
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
};

type HomeStackParamList = {
  Home: undefined;
};

type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

type GroupScreenProps<T extends keyof GroupStackParamList> =
  NativeStackScreenProps<GroupStackParamList, T>;

export type {
  AuthStackParamList,
  RootStackParamList,
  BottomTabParamList,   // ✅ 추가
  AuthScreenProps,
  GroupStackParamList,
  GroupScreenProps,
  HomeStackParamList,
};