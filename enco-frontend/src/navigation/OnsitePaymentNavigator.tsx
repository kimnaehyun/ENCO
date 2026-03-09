import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PaymentMethodScreen from '../screens/OnsitePayment/PaymentMethodScreen';
import GPSScanScreen from '../screens/OnsitePayment/GPSScanScreen';
import PaymentSuccess from '../screens/OnsitePayment/PaymentSuccess';

export default function OnsitePaymentNavigator() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen name="GPSScan" component={GPSScanScreen} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} />
    </Stack.Navigator>
  );
}
