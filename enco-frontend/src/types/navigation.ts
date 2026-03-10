import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native";
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

// ─── Root ─────────────────────────────────────────────────────────────────────
// 그룹 생성 3단계 플로우가 여기 포함됨 (모달 스택으로 탭과 분리)
type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined;
  // 그룹 생성 모달 플로우
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

// ─── Bottom Tab ───────────────────────────────────────────────────────────────
type BottomTabParamList = {
  Account: undefined;
  HomeTab: undefined;
  Together: NavigatorScreenParams<GroupStackParamList>;
};

// ─── Group Stack (탭 내부) ────────────────────────────────────────────────────
// 생성 플로우(GroupCreate / GroupCardRecommend / GroupPinSetup)는 제거됨.
// → RootStackParamList 에서 모달로 관리.
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
// GroupDashboard 및 하위 그룹 화면들을 HomeStack에 포함.
// HomeScreen → GroupDashboard push → 뒤로가기 시 HomeScreen 복귀.
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

  OcrTest: CommonParams | undefined;
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
};