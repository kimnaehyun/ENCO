import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import BottomNavigator from './BottomNavigator';
import InternetPayNavigator from './InternetPaymentNavigator';
import { useAuthStore } from '../store/useAuthStore';

import GroupCreateScreen from '../screens/group/GroupCreateScreen';
import GroupCardRecommendScreen from '../screens/group/GroupCardRecommendScreen';
import GroupPinSetupScreen from '../screens/group/GroupPinSetupScreen';

import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [isBooting, setIsBooting] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const t = setTimeout(() => setIsBooting(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isBooting ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : user ? (
        <>
          <Stack.Screen name="App" component={BottomNavigator} />

          <Stack.Screen
            name="InternetPayFlow"
            component={InternetPayNavigator}
            options={{ headerShown: false }}
          />

          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen name="GroupCreate" component={GroupCreateScreen} />
            <Stack.Screen
              name="GroupCardRecommend"
              component={GroupCardRecommendScreen}
            />
            <Stack.Screen name="GroupPinSetup" component={GroupPinSetupScreen} />
          </Stack.Group>
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}