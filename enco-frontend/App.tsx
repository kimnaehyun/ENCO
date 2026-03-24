import 'react-native-gesture-handler';
import { useEffect, useRef } from 'react';
import {
  CommonActions,
  NavigationContainer,
  useNavigationContainerRef,
  type LinkingOptions,
} from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { NotificationsProvider } from './src/contexts/NotificationsContext';
import './global.css';
import type { RootStackParamList } from './src/types/navigation';
import { BackHandler, Linking, ToastAndroid } from 'react-native';
import { ROUTES } from './src/constants/routes';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['enco://app'],
  config: {
    screens: {
      // 결제 딥링크 (기존)
      InternetPayFlow: {
        screens: {
          CreateInternetPaymentRequest: 'pay',
          PaymentApprovalPending: 'pay/pending',
          InternetPaymentPin: 'pay/pin',
          PaymentSuccess: {
            path: 'pay/success',
            parse: {
              amount: (value: string) => Number(value),
              callbackUrl: (value: string) => value,
              orderId: (value: string) => value,
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

function App() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const backPressedOnce = useRef(false);

  // ── 딥링크에서 초대 토큰 파싱 ──
  const handleDeepLink = (url: string | null) => {
    console.log('[DeepLink] handleDeepLink called with:', url);
    if (!url) return;

    try {
      // enco://app/invite?token=xxx&groupName=xxx 형태 파싱
      const tokenMatch = url.match(/invite\?token=([^&]+)/);
      const nameMatch = url.match(/groupName=([^&]+)/);
      console.log('[DeepLink] tokenMatch:', tokenMatch);

      if (tokenMatch && tokenMatch[1]) {
        const inviteToken = tokenMatch[1];
        const groupName = nameMatch
          ? decodeURIComponent(nameMatch[1])
          : undefined;
        console.log(
          '[DeepLink] inviteToken:',
          inviteToken,
          'groupName:',
          groupName,
        );
        console.log(
          '[DeepLink] navigationRef.isReady():',
          navigationRef.isReady(),
        );

        const doNavigate = () => {
          if (navigationRef.isReady()) {
            console.log('[DeepLink] Navigating to GroupInviteEntry');
            navigationRef.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: 'App',
                    state: {
                      routes: [
                        {
                          name: 'HomeTab',
                          state: {
                            routes: [
                              { name: 'Home' },
                              {
                                name: 'GroupInviteEntry',
                                params: { inviteToken, groupName },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                ],
              }),
            );
          } else {
            console.log(
              '[DeepLink] Navigation not ready, retrying in 500ms...',
            );
            setTimeout(doNavigate, 500);
          }
        };

        // 약간의 딜레이 후 시도, 준비 안 되면 재시도
        setTimeout(doNavigate, 300);
      }
    } catch (e) {
      console.warn('[DeepLink] 파싱 실패:', e);
    }
  };

  // ── 딥링크 리스너 ──
  useEffect(() => {
    // 앱이 종료 상태에서 딥링크로 열린 경우
    Linking.getInitialURL().then(url => {
      console.log('[DeepLink] getInitialURL:', url);
      handleDeepLink(url);
    });

    // 앱이 이미 실행 중일 때 딥링크가 들어온 경우
    const sub = Linking.addEventListener('url', ({ url }) => {
      console.log('[DeepLink] addEventListener url:', url);
      handleDeepLink(url);
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      // 뒤로 갈 스크린이 있으면 그냥 통과
      if (navigationRef.canGoBack()) {
        return false;
      }

      // 스택 바닥일 때 - 현재 탭 확인
      const currentRoute = navigationRef.getCurrentRoute();
      const routeName = currentRoute?.name;

      // 홈 탭 화면이 아니면 홈으로 이동
      const homeRoutes = ['Home', 'HomeDetail']; // 홈 스택 화면들
      if (!homeRoutes.includes(routeName ?? '')) {
        navigationRef.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'App',
                state: {
                  routes: [{ name: ROUTES.TAB_HOME }],
                },
              },
            ],
          }),
        );
        return true;
      }

      // 홈 탭 바닥일 때만 두번 누르면 종료
      if (backPressedOnce.current) {
        BackHandler.exitApp();
        return true;
      }

      backPressedOnce.current = true;
      ToastAndroid.show('한 번 더 누르면 종료됩니다', ToastAndroid.SHORT);
      setTimeout(() => {
        backPressedOnce.current = false;
      }, 2000);

      return true;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );
    return () => subscription.remove();
  }, []);
  return (
    <NotificationsProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer
            linking={linking}
            onStateChange={state => {}}
            ref={navigationRef}
          >
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </NotificationsProvider>
  );
}

export default App;
