import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Splash: undefined;
  AuthLanding: undefined;
  SignupForm: undefined;
  SignupPinSetup: {
    name: string;
    birth: string;
    phone: string;
    email: string;
  };
};

type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

type Step = 'name' | 'birth' | 'phone' | 'email' | 'done';

export type { RootStackParamList, RootStackScreenProps, Step };
