import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BottomNavigator from "./BottomNavigator";

/*--스크린--*/
import DetailScreen from "../screens/DetailScreen";
import SplashScreen from "../screens/SplashScreen";
import AuthLandingScreen from "../screens/auth/AuthLandingScreen";
import SignupFormScreen from "../screens/auth/SignupFormScreen";
import SignupPinSetupScreen from "../screens/auth/SignupPinSetupScreen.tsx";

export type RootStackParamList = {
  Splash: undefined;
  AuthLanding: undefined;
  SignupForm: undefined;
  SignupPinSetup: { name: string; birth: string; phone: string; email: string };

};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsBooting(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isBooting ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : (
          <>
            <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
            <Stack.Screen name="SignupForm" component={SignupFormScreen} />
            <Stack.Screen name="SignupPinSetup" component={SignupPinSetupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}