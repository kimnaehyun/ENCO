// src/services/notificationService.ts
// SSE(Server-Sent Events) 알림 구독 + 알림 API
import { getCachedAccessToken } from '../utils/tokenStorage';
import EventSource from 'react-native-sse';

const CHAT_BASE_URL = 'https://api.ssafywte.site/chat-service';
const AUTH_BASE_URL = 'https://api.ssafywte.site/auth-service';

export type SseNotification = {
  notificationId: string;
  type: string;
  title: string;
  content: string;
  groupId?: number;
  chargeTargetId?: number;
  amount?: number;
  createdAt: string;
};

type SseCallbacks = {
  onNotification: (data: SseNotification) => void;
  onError?: (error: any) => void;
};

let eventSource: any = null;

/**
 * SSE 알림 구독
 * GET /api/v1/notifications/subscribe
 * Header: Authorization, X-User-Id
 */
export function subscribeSse(userId: number, callbacks: SseCallbacks) {
  unsubscribeSse();

  const accessToken = getCachedAccessToken();
  if (!accessToken) {
    console.warn('[SSE] accessToken이 없어 구독을 시작할 수 없습니다.');
    return;
  }

  const url = `${CHAT_BASE_URL}/api/v1/notifications/subscribe`;

  try {
    eventSource = new EventSource(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-User-Id': String(userId),
        Accept: 'text/event-stream',
      },
      method: 'GET',
      reconnect: false,
    });

    eventSource.addEventListener('notification', (event: any) => {
      try {
        const data: SseNotification = JSON.parse(event.data);
        console.log('[SSE] 알림 수신:', data.type, data.title);
        callbacks.onNotification(data);
      } catch (e) {
        console.warn('[SSE] 알림 파싱 실패:', e);
      }
    });

    eventSource.addEventListener('heartbeat', () => {
      // keep-alive, 무시
    });

    eventSource.addEventListener('error', (error: any) => {
      console.warn('[SSE] 에러:', error);
      callbacks.onError?.(error);
    });

    eventSource.addEventListener('open', () => {
      console.log('[SSE] 연결 성공 (userId:', userId, ')');
    });

    console.log('[SSE] 구독 시작 userId:', userId);
  } catch (error) {
    console.error('[SSE] 구독 실패:', error);
  }
}

/**
 * SSE 연결 종료
 */
export function unsubscribeSse() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
    console.log('[SSE] 연결 종료');
  }
}

/**
 * FCM 토큰을 auth-service에 등록
 * PUT /api/v1/auth/fcm-token
 */
export async function registerFcmToken(fcmToken: string): Promise<void> {
  const accessToken = getCachedAccessToken();
  try {
    const res = await fetch(`${AUTH_BASE_URL}/api/v1/users/fcm-token`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: accessToken ? `Bearer ${accessToken}` : '',
      },
      body: JSON.stringify({ fcmToken }),
    });
    console.log('[FCM] 토큰 서버 등록:', res.status);
  } catch (err) {
    console.warn('[FCM] 토큰 서버 등록 실패:', err);
  }
}