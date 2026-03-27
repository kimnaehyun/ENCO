import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyPageScreen from '../screens/user/MyPageScreen';
import EditMyPageScreen from '../screens/user/EditMyPageScreen';

const Stack = createNativeStackNavigator();

export default function UserStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyPage" component={MyPageScreen} />
      <Stack.Screen name="EditMyPage" component={EditMyPageScreen} />
    </Stack.Navigator>
  );
}