// src/hooks/useNotificationSetup.ts
// 로그인 후 FCM 토큰 발급 → 서버 등록 → SSE 구독을 자동으로 처리하는 훅
import { useEffect, useCallback } from 'react';
import { AppState, AppStateStatus, InteractionManager } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { useNotifications } from '../contexts/NotificationsContext';
import { getFcmToken, onFcmTokenRefresh } from '../utils/fcm';
import {
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import {
  subscribeSse,
  unsubscribeSse,
  registerFcmToken,
  SseNotification,
} from '../services/notificationService';

// navigationRef를 외부에서 주입받기 위한 holder
let _navigationRef: any = null;
// navigator 준비 전 수신된 알림 데이터 임시 보관
let _pendingNavData: Record<string, any> | null = null;

export function setNotificationNavigationRef(ref: any) {
  _navigationRef = ref;
}

/**
 * NavigationContainer onReady 콜백에서 호출 → killed 상태 알림 네비게이션 처리
 */
export function flushPendingNotificationNavigation() {
  if (_pendingNavData) {
    const data = _pendingNavData;
    _pendingNavData = null;
    handleNotificationPress(data);
  }
}

/**
 * 포그라운드에서 FCM 수신 시 시스템 알림 배너 표시
 */
async function displayLocalNotification(
  title: string,
  body: string,
  data: Record<string, any>,
) {
  try {
    console.log('[Notifee] 로컬 알림 표시 시도:', title);
    const channelId = await notifee.createChannel({
      id: 'default',
      name: '기본 알림',
      importance: AndroidImportance.HIGH,
    });
    console.log('[Notifee] 채널 생성 완료:', channelId);

    await notifee.displayNotification({
      title,
      body,
      data,
      android: {
        channelId,
        smallIcon: 'small_hamco_64',
        pressAction: { id: 'default' },
      },
    });
    console.log('[Notifee] 알림 표시 성공');
  } catch (err) {
    console.error('[Notifee] 알림 표시 실패:', err);
  }
}

/**
 * 알림 탭 시 타입에 따라 해당 화면으로 네비게이션
 */
function handleNotificationPress(data: Record<string, any>) {
  if (!_navigationRef?.isReady()) {
    // navigator 준비 전이면 저장해두고 onReady 때 flush
    _pendingNavData = data;
    return;
  }

  // 로그인 상태가 아니면 로그인 완료 후 처리
  const user = useAuthStore.getState().user;
  if (!user) {
    _pendingNavData = data;
    return;
  }

  const rawType = String(data.type ?? '');
  const groupId = data.groupId ? Number(data.groupId) : undefined;

  // 현장결제 요청 알림 → 바코드/QR 결제 화면으로 바로 이동
  if (rawType === 'ONSITE_PAYMENT_REQUEST' && groupId) {
    _navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'App',
            state: {
              routes: [
                {
                  name: 'Account',
                  state: {
                    routes: [
                      { name: 'PaymentMethod', params: { title: '현장결제', groupId, isLeader: false } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      }),
    );
    return;
  }

  // 그 외 알림 → 알림 센터
  _navigationRef.dispatch(
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
                    { name: 'UserNotifications' },
                  ],
                },
              },
            ],
          },
        },
      ],
    }),
  );
}

/**
 * App.tsx 또는 RootNavigator 안에서 한 번만 호출하세요.
 *
 * 1. 로그인 상태가 되면 FCM 토큰 발급 → auth-service에 등록
 * 2. SSE 구독 시작 → 실시간 알림을 NotificationsContext에 push
 * 3. 로그아웃 시 SSE 해제
 * 4. 앱이 포그라운드로 돌아오면 SSE 재연결
 * 5. 포그라운드에서도 시스템 푸시 배너 표시
 * 6. 알림 탭 시 해당 화면으로 이동
 */
export function useNotificationSetup() {
  const user = useAuthStore(s => s.user);
  const userId = useAuthStore(s => s.userId);
  const { pushOne } = useNotifications();

  // 로그인 완료 후 → 모든 네비게이션 전환 애니메이션이 끝난 뒤 pending 알림 처리
  useEffect(() => {
    if (!user) return;
    const task = InteractionManager.runAfterInteractions(() => {
      flushPendingNotificationNavigation();
    });
    return () => task.cancel();
  }, [user]);

  // notifee 이벤트 리스너 (알림 탭 처리)
  useEffect(() => {
    // 앱이 포그라운드일 때 알림 탭
    const unsubNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification?.data) {
        handleNotificationPress(detail.notification.data);
      }
    });

    // 앱이 백그라운드에서 Notifee 알림 탭으로 열렸을 때
    notifee.getInitialNotification().then(initialNotification => {
      if (initialNotification?.notification?.data) {
        handleNotificationPress(initialNotification.notification.data);
      }
    });

    // Firebase 자동 알림 탭 처리 (백그라운드 → 포그라운드)
    const messaging = getMessaging();
    const unsubFirebaseOpen = onNotificationOpenedApp(messaging, (remoteMessage) => {
      if (remoteMessage.data) {
        handleNotificationPress(remoteMessage.data as Record<string, any>);
      }
    });

    // Firebase 자동 알림 탭 처리 (앱이 killed 상태에서 열렸을 때)
    getInitialNotification(messaging).then(remoteMessage => {
      if (remoteMessage?.data) {
        handleNotificationPress(remoteMessage.data as Record<string, any>);
      }
    });

    return () => {
      unsubNotifee();
      unsubFirebaseOpen();
    };
  }, []);

  useEffect(() => {
    if (!user || !userId) {
      // 로그아웃 상태 → SSE 해제
      unsubscribeSse();
      return;
    }

    const setup = async () => {
      try {
        // 1. FCM 토큰 발급
        const fcmToken = await getFcmToken();
        if (fcmToken) {
          // 2. 서버에 FCM 토큰 등록
          await registerFcmToken(fcmToken);
        }

        // 3. SSE 구독 시작
        subscribeSse(userId, {
          onNotification: (data: SseNotification) => {
            // NotificationsContext에 실시간 알림 추가
            pushOne({
              id: data.notificationId,
              type: mapNotificationType(data.type),
              title: data.title,
              body: data.content,
              createdAt: data.createdAt,
              isRead: false,
              groupId: data.groupId ? String(data.groupId) : undefined,
              amount: data.amount,
            });
          },
          onError: (err) => {
            console.warn('[NotificationSetup] SSE 에러:', err);
          },
        });
      } catch (err) {
        console.error('[NotificationSetup] 초기화 실패:', err);
      }
    };

    setup();

    // FCM 포그라운드 메시지 리스너
    const unsubFcm = onMessage(getMessaging(), async (remoteMessage) => {
      console.log('[NotificationSetup] FCM 포그라운드 메시지:', JSON.stringify(remoteMessage, null, 2));
      const data = remoteMessage.data ?? {};
      const title = remoteMessage.notification?.title ?? String(data.type ?? '알림');
      const body = remoteMessage.notification?.body ?? '';

      // 인앱 알림 목록에 추가
      pushOne({
        id: String(data.notificationId ?? Date.now()),
        type: mapNotificationType(String(data.type ?? '')),
        title,
        body,
        createdAt: String(data.createdAt ?? new Date().toISOString()),
        isRead: false,
        groupId: data.groupId ? String(data.groupId) : undefined,
        amount: data.amount ? Number(data.amount) : undefined,
      });

      // 포그라운드에서는 Firebase SDK가 자동 배너를 표시하지 않으므로
      // Notifee로 직접 시스템 알림 표시 (백그라운드/killed에서는 onMessage가 호출되지 않아 중복 없음)
      await displayLocalNotification(title, body, data as Record<string, any>);
    });

    // FCM 토큰 갱신 리스너
    const unsubToken = onFcmTokenRefresh(async (newToken) => {
      console.log('[NotificationSetup] FCM 토큰 갱신됨');
      await registerFcmToken(newToken);
    });

    // 앱 포그라운드 복귀 시 SSE 재연결
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active' && user) {
        console.log('[NotificationSetup] 앱 포그라운드 복귀 → SSE 재연결');
        subscribeSse(userId, {
          onNotification: (data: SseNotification) => {
            pushOne({
              id: data.notificationId,
              type: mapNotificationType(data.type),
              title: data.title,
              body: data.content,
              createdAt: data.createdAt,
              isRead: false,
              groupId: data.groupId ? String(data.groupId) : undefined,
              amount: data.amount,
            });
          },
        });
      }
    };
    const appStateSub = AppState.addEventListener('change', handleAppState);

    return () => {
      unsubscribeSse();
      unsubFcm();
      unsubToken();
      appStateSub.remove();
    };
  }, [user, userId]);
}

/**
 * 서버 알림 타입 → 프론트 NotiType 매핑
 */
function mapNotificationType(serverType: string): 'DUE' | 'VOTE' | 'LEDGER' | 'SETTLEMENT' {
  switch (serverType) {
    case 'SETTLEMENT_REMINDER':
      return 'SETTLEMENT';
    case 'DUES_REMINDER':
    case 'DUE_REMINDER':
      return 'DUE';
    case 'VOTE_CREATED':
    case 'PAYMENT_APPROVED':
    case 'PAYMENT_REJECTED':
    case 'PAYMENT_CANCELED':
    case 'VOTE':
      return 'VOTE';
    case 'LEDGER_UPDATE':
    case 'LEDGER':
      return 'LEDGER';
    case 'ONSITE_PAYMENT_REQUEST':
    case 'ONSITE_PAYMENT_COMPLETE':
      return 'SETTLEMENT';
    case 'CHAT_MESSAGE':
    default:
      return 'VOTE'; // 기본 폴백: 결제화면 오탐 방지
  }
}
