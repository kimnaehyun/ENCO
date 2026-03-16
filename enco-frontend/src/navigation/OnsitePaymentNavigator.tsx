import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PaymentMethodScreen from '../screens/OnsitePayment/PaymentMethodScreen';
import PaymentSuccess from '../screens/Payment/PaymentSuccess';

export default function OnsitePaymentNavigator() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackVisible: false,
      }}
    >
      <Stack.Screen
        name="PaymentMethod"
        component={PaymentMethodScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccess}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
