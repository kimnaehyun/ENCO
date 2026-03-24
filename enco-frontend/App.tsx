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
    },
  },
};

function App() {
  useEffect(() => {
    Linking.getInitialURL().then(url => {});

    const sub = Linking.addEventListener('url', ({ url }) => {});

    return () => sub.remove();
  }, []);

  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const backPressedOnce = useRef(false);

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

// 에러페이지 테스트용 코드
// import 'react-native-gesture-handler';
// import React from 'react';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import NetworkErrorTestScreen from './src/screens/test/NetworkErrorTestScreen';

// function App() {
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <SafeAreaProvider>
//         <NetworkErrorTestScreen />
//       </SafeAreaProvider>
//     </GestureHandlerRootView>
//   );
// }

// export default App;
