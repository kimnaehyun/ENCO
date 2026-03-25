import { Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROUTES } from '../constants/routes';
import HomeStackNavigator from './HomeStackNavigator';
import OnsitePaymentNavigator from './OnsitePaymentNavigator';
import UserStackNavigator from './UserStackNavigator';
import { images } from '../types/images';
import InternetPayNavigator from './InternetPaymentNavigator';

const Tab = createBottomTabNavigator();

export default function BottomNavigator() {
  const { bottom } = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName={ROUTES.TAB_HOME}
      backBehavior="none"
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          height: 64 + bottom,
          paddingBottom: bottom,
        },
      }}
    >
      <Tab.Screen
        name={ROUTES.TAB_PAYMENT}
        component={InternetPayNavigator}
        options={{
          popToTopOnBlur: true,
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={images.walletIcon}
              style={{
                width: size,
                height: size,
                tintColor: focused ? '#1428A0' : '#9CA3AF',
              }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tab.Screen
        name={ROUTES.TAB_HOME}
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={images.homeIcon}
              style={{
                width: size,
                height: size,
                tintColor: focused ? '#1428A0' : '#9CA3AF',
              }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tab.Screen
        name={ROUTES.TAB_GROUP}
        component={UserStackNavigator}
        options={{
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={images.profileIcon}
              style={{
                width: size,
                height: size,
                tintColor: focused ? '#1428A0' : '#9CA3AF',
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
