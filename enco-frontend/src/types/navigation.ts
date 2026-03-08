// src/types/navigation.ts
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { GroupParams } from "./common";

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

  GroupDashboard: GroupParams | undefined;
  GroupInfo: GroupParams | undefined;
  GroupVotes: GroupParams | undefined;
  GroupPay: GroupParams | undefined;
  GroupChat: GroupParams | undefined;
  GroupLedger: GroupParams | undefined;

  AdminMenu: { groupId?: string; groupName?: string } | undefined;
  AdminReceipt: { groupId?: string; groupName?: string } | undefined;
  AdminMembers: { groupId?: string; groupName?: string } | undefined;
  AdminCard: { groupId?: string; groupName?: string } | undefined;

   // (선택) 투표 상세 같은 거 추가되면 여기 확장
  GroupVoteDetail?: { voteId: string; groupId?: string; groupName?: string };
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