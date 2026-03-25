import {
  getMessaging,
  getToken,
  onTokenRefresh,
  requestPermission,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';

/**
 * FCM 토큰 발급
 * - 알림 권한이 없으면 먼저 요청
 * - 토큰 발급 실패 시 null 반환
 */
export async function getFcmToken(): Promise<string | null> {
  try {
    const messaging = getMessaging();
    const authStatus = await requestPermission(messaging);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.warn('[FCM] 알림 권한 거부됨');
      return null;
    }

    const token = await getToken(messaging);
    console.log('[FCM] 토큰 발급 성공');
    return token;
  } catch (err) {
    console.error('[FCM] 토큰 발급 실패:', err);
    return null;
  }
}

/**
 * FCM 토큰 갱신 리스너 등록
 * @returns 구독 해제 함수
 */
export function onFcmTokenRefresh(callback: (token: string) => void): () => void {
  const messaging = getMessaging();
  return onTokenRefresh(messaging, callback);
}
