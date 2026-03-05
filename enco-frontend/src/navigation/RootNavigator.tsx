import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DetailScreen from '../screens/DetailScreen';
import BottomNavigator from './BottomNavigator';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={BottomNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Detail" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
