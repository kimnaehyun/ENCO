import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { VotesProvider } from './src/contexts/VotesContext';
import './global.css';
function App() {
  return (
    <VotesProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />;
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
    </VotesProvider>
  );
}

export default App;