/**
 * @format
 */
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import 'text-encoding';
import { AppRegistry } from 'react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// 백그라운드/종료 상태에서 FCM 메시지 수신 시 처리
// notifee는 여기서 import하지 않고, 핸들러 내부에서 lazy require
setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
  const notifee = (await import('@notifee/react-native')).default;
  const { AndroidImportance } = await import('@notifee/react-native');

  const data = remoteMessage.data ?? {};
  const channelId = await notifee.createChannel({
    id: 'default',
    name: '기본 알림',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: remoteMessage.notification?.title ?? String(data.type ?? '알림'),
    body: remoteMessage.notification?.body ?? String(data.content ?? ''),
    data: data,
    android: {
      channelId,
      smallIcon: 'ic_launcher',
      pressAction: { id: 'default' },
    },
  });
});

AppRegistry.registerComponent(appName, () => App);
