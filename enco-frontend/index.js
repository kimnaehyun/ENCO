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
import notifee, { AndroidImportance } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

// 백그라운드/종료 상태에서 FCM 메시지 수신 시 로컬 알림 표시
setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
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
