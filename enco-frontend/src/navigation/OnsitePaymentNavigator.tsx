import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PaymentMethodScreen from '../screens/OnsitePayment/PaymentMethodScreen';
import GPSScanScreen from '../screens/OnsitePayment/GPSScanScreen';
import PaymentSuccess from '../screens/OnsitePayment/PaymentSuccess';
import PaymentPinScreen from '../screens/payment/PaymentPinScreen';

export default function OnsitePaymentNavigator() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="OnsitePaymentPin"
        component={PaymentPinScreen}
        initialParams={{ screen: 'GPSScan' }}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GPSScan"
        component={GPSScanScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccess}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
