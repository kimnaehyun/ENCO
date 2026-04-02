import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Barcode from '../../components/onsite/Barcode';
import QR from '../../components/onsite/QR';

export default function ToggleNavigator() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen name="barcode" component={Barcode} />
      <Stack.Screen name="qr" component={QR} />
    </Stack.Navigator>
  );
}
