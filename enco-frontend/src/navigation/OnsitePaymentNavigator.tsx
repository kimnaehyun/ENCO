import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PaymentMethodScreen from '../screens/OnsitePayment/PaymentMethodScreen';
import PaymentSuccess from '../screens/OnsitePayment/PaymentSuccess';
import SelectGroupScreen from '@/screens/payment/SelectGroupScreen';
import PaymentStartScreen from '@/screens/payment/PaymentStartScreen';

export default function OnsitePaymentNavigator() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackVisible: false,
      }}
    >
      <Stack.Screen
        name="PaymentStartScreen"
        component={PaymentStartScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SelectGroupScreen"
        component={SelectGroupScreen}
        options={{ headerShown: false }}
        initialParams={{ paymentType: 'onsite' }}
      />
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
