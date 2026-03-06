// src/types/navigation.ts
import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type AuthStackParamList = {
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

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;