// src/hooks/useNotificationSetup.ts
// 로그인 후 FCM 토큰 발급 → 서버 등록 → SSE 구독을 자동으로 처리하는 훅
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useNotifications } from '../contexts/NotificationsContext';
import { getFcmToken, onFcmTokenRefresh } from '../utils/fcm';
import {
  subscribeSse,
  unsubscribeSse,
  registerFcmToken,
  SseNotification,
} from '../services/notificationService';

/**
 * App.tsx 또는 RootNavigator 안에서 한 번만 호출하세요.
 *
 * 1. 로그인 상태가 되면 FCM 토큰 발급 → auth-service에 등록
 * 2. SSE 구독 시작 → 실시간 알림을 NotificationsContext에 push
 * 3. 로그아웃 시 SSE 해제
 * 4. 앱이 포그라운드로 돌아오면 SSE 재연결
 */
export function useNotificationSetup() {
  const user = useAuthStore(s => s.user);
  const userId = useAuthStore(s => s.userId);
  const { pushOne } = useNotifications();

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
    case 'VOTE':
      return 'VOTE';
    case 'LEDGER_UPDATE':
    case 'LEDGER':
      return 'LEDGER';
    case 'CHAT_MESSAGE':
    default:
      return 'DUE'; // 기본 폴백
  }
}