import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import {
  NavigationContainer,
  type LinkingOptions,
} from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { VotesProvider } from './src/contexts/VotesContext';
import { NotificationsProvider } from './src/contexts/NotificationsContext';
import './global.css';
import type { RootStackParamList } from './src/types/navigation';
import { Linking } from 'react-native';

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

  return (
    <VotesProvider>
      <NotificationsProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <NavigationContainer linking={linking} onStateChange={state => {}}>
              <RootNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </NotificationsProvider>
    </VotesProvider>
  );
}

export default App;
