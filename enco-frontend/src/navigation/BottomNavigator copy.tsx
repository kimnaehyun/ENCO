import { Image } from 'react-native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import AccountScreen from '../screens/AccountScreen';

import TogetherScreen from '../screens/TogetherScreen';
import DetailScreen from '../screens/DetailScreen';
import SettingScreen from '../screens/SettingScreen';

const Tab = createBottomTabNavigator();

export default function BottomNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={
                focused
                  ? require('../assets/icons/home_active.png')
                  : require('../assets/icons/home.png')
              }
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Together"
        component={TogetherScreen}
        options={{
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={
                focused
                  ? require('../assets/icons/home_active.png')
                  : require('../assets/icons/home.png')
              }
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={
                focused
                  ? require('../assets/icons/home_active.png')
                  : require('../assets/icons/home.png')
              }
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Setting"
        component={SettingScreen}
        options={{
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={
                focused
                  ? require('../assets/icons/home_active.png')
                  : require('../assets/icons/home.png')
              }
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
