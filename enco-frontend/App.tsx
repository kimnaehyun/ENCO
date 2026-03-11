import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { VotesProvider } from './src/contexts/VotesContext';
import { NotificationsProvider } from './src/contexts/NotificationsContext';
import type { RootStackParamList } from './src/types/navigation';
import { LinkingOptions } from '@react-navigation/native';
import './global.css';

const linking : LinkingOptions<RootStackParamList> ={
  prefixes: ["enco://app"],
  config:{
    screens:{
      App: {
        screens:{
          InternetPay :{
            screens:{
              PaymentSuccess: 'pay/success',
            }
          }
        }
      }
    }
  }
}

function App() {
  return (
    <VotesProvider>
      <NotificationsProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <NavigationContainer linking={linking}>
              <RootNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </NotificationsProvider>
    </VotesProvider>
  );
}

export default App;