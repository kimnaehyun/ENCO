import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthLandingScreen from "../screens/auth/AuthLandingScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import InputInfoScreen from "../screens/auth/InputInfoScreen";
import SignupPinSetupScreen from "../screens/auth/SignupPinSetupScreen";
import SignupVerifyScreen from "../screens/auth/SignupVerifyScreen";
import SignupCompleteScreen from "../screens/auth/SignupCompleteScreen";

import type { AuthStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignupVerify" component={SignupVerifyScreen} />
      <Stack.Screen name="InputInfo" component={InputInfoScreen} />
      <Stack.Screen name="SignupPinSetup" component={SignupPinSetupScreen} />
      <Stack.Screen name="SignupComplete" component={SignupCompleteScreen} />
    </Stack.Navigator>
  );
}