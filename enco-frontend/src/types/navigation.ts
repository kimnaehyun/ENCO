// src/types/navigation.ts
import { NativeStackScreenProps } from "@react-navigation/native-stack";
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

type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

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
  AdminSettle: CommonParams | undefined

   // (선택) 투표 상세 같은 거 추가되면 여기 확장
  GroupVoteDetail: { voteId: string } & CommonParams;
  GroupVoteCreate : {}
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

export type {AuthStackParamList, RootStackParamList, AuthScreenProps, GroupStackParamList}