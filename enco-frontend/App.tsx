import 'react-native-gesture-handler';
import { useCallback, useEffect, useRef } from 'react';
import {
  CommonActions,
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { NotificationsProvider } from './src/contexts/NotificationsContext';
import './global.css';
import type { RootStackParamList } from './src/types/navigation';
import {
  Alert,
  BackHandler,
  Linking,
  PermissionsAndroid,
  Platform,
  ToastAndroid,
} from 'react-native';
import { ROUTES } from './src/constants/routes';
import { linking } from '@/config/linking';
import messaging from '@react-native-firebase/messaging';
import { useAuthStore } from '@/store/useAuthStore';
import { locationApi } from '@/services/payment/location';
import Geolocation from 'react-native-geolocation-service';
import { setNotificationNavigationRef, flushPendingNotificationNavigation } from './src/hooks/useNotificationSetup';

function App() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const backPressedOnce = useRef(false);

  const pendingNotification = useRef<any>(null);
  const user = useAuthStore(state => state.user); // 인증 상태 구독

  // FCM 알림 저장
  // 기존 FCM useEffect에 클린업 추가
  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) pendingNotification.current = remoteMessage;
      });

    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      pendingNotification.current = remoteMessage;
    });

    return () => {
      unsubscribe();
      // 앱 종료/언마운트 시 인터벌 정리
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, []);

  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const getCurrentLocation = useCallback((): Promise<{
    latitude: number;
    longitude: number;
  }> => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => reject(error),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  }, []);

  const myFunction = useCallback(async (remoteMessage: any) => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('❌ 권한 없음', '위치 권한이 거부되었습니다.');
          return;
        }
      }

      const groupId = Number(remoteMessage.data?.groupId);
      if (!groupId) return;

      // 이미 실행 중인 인터벌 있으면 정리
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }

      const sendLocation = async () => {
        try {
          const { latitude, longitude } = await getCurrentLocation();
          const response = await locationApi.check(
            groupId,
            latitude,
            longitude,
            false,
          );

          // 서버에서 barcode 반환 시 인터벌 종료
          if (response.data?.result?.barcode !== null) {
            if (Platform.OS === 'android') {
              ToastAndroid.show('위치 인증 완료!', ToastAndroid.SHORT);
            } else {
              Alert.alert('위치 인증 완료!');
            }
            clearInterval(locationIntervalRef.current!);
            locationIntervalRef.current = null;
          }
        } catch (error: any) {
          console.error('위치 전송 실패:', error?.message);
        }
      };

      // 즉시 한 번 실행 후 3초마다 반복
      sendLocation();
      locationIntervalRef.current = setInterval(sendLocation, 3000);
    } catch (error: any) {
      Alert.alert('💥 에러 발생', error?.message ?? JSON.stringify(error));
    }
  }, [getCurrentLocation]);

  // 로그인 완료 감지 → pending 알림 처리
  useEffect(() => {
    if (user && pendingNotification.current) {
      myFunction(pendingNotification.current);
      pendingNotification.current = null;
    }
  }, [user, myFunction]); // user가 null → 값으로 바뀌는 순간 실행

  // 알림 탭 시 네비게이션에 사용할 ref 등록
  // onReady로 이동 → killed 상태 pending 알림 자동 flush

  // 앱 시작 시 권한 요청 (알림, 카메라, 위치)
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const requestPermissions = async () => {
      try {
        const permissions: string[] = [
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ];
        // POST_NOTIFICATIONS는 Android 13(API 33) 이상에서만 필요
        if (Number(Platform.Version) >= 33) {
          permissions.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        }
        await PermissionsAndroid.requestMultiple(permissions as any);
      } catch (err) {
        console.warn('[Permissions] 권한 요청 실패:', err);
      }
    };

    requestPermissions();
  }, []);

  // ── 딥링크에서 초대 토큰 파싱 ──
  const handleDeepLink = useCallback((url: string | null) => {
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
  }, [navigationRef]);

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
  }, [handleDeepLink]);

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
  }, [navigationRef]);
  return (
    <NotificationsProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer
            linking={linking}
            onStateChange={_state => {}}
            ref={navigationRef}
            onReady={() => {
              setNotificationNavigationRef(navigationRef);
              flushPendingNotificationNavigation();
            }}
          >
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </NotificationsProvider>
  );
}

export default App;
