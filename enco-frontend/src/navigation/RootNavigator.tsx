import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import BottomNavigator from './BottomNavigator';
import { useAuthStore } from '../store/useAuthStore';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined;
};

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
        <Stack.Screen name="App" component={BottomNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}