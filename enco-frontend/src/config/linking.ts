import { RootStackParamList } from '@/types/navigation';
import { LinkingOptions } from '@react-navigation/native';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['enco://app'],
  config: {
    screens: {
      // 결제 딥링크 (기존)
      InternetPayFlow: {
        screens: {
          PaymentStartScreen: {
            path: 'pay/success',
            parse: {
              amount: (value: string) => Number(value),
              callbackUrl: (value: string) => value,
              orderId: (value: string) => value,
              storeName: (value: string) => value,
            },
          },
        },
      },

      // 초대 딥링크 (추가)
      // enco://app/invite?token=fb510545-d6d7-...
      App: {
        screens: {
          HomeTab: {
            screens: {
              GroupInviteEntry: {
                path: 'invite',
                parse: {
                  inviteToken: (token: string) => token,
                },
              },
            },
          },
        },
      },
    },
  },
};
