// src/navigation/AuthNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthLandingScreen from "../screens/auth/AuthLandingScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import SignupFormScreen from "../screens/auth/SignupFormScreen";
import SignupPinSetupScreen from "../screens/auth/SignupPinSetupScreen";
import type { AuthStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignupForm" component={SignupFormScreen} />
      <Stack.Screen name="SignupPinSetup" component={SignupPinSetupScreen} />
    </Stack.Navigator>
  );
}