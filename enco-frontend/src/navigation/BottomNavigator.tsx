import { Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';

import { ROUTES } from '../constants/routes';

import HomeStackNavigator from './HomeStackNavigator';
import GroupStackNavigator from './GroupStackNavigator';
import OnsitePaymentNavigator from './OnsitePaymentNavigator';
import InternetPayNavigator from './InternetPaymentNavigator';

const Tab = createBottomTabNavigator();

export default function BottomNavigator() {
  return (
    <Tab.Navigator
      initialRouteName={ROUTES.TAB_HOME}
      backBehavior="none"
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
      }}
    >
      {/* 인터넷 결제 */}
      {/*  <Tab.Screen
        name={ROUTES.TAB_PAYMENT}
        component={InternetPayNavigator}
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
      */}
      {/* 현장 결제 */}
      <Tab.Screen
        name={ROUTES.TAB_PAYMENT}
        component={OnsitePaymentNavigator}
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
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.dispatch(
              CommonActions.navigate({
                name: ROUTES.TAB_PAYMENT,
                params: { screen: 'OnsitePaymentPin' },
              }),
            );
          },
        })}
      />
      {/* 홈 */}
      <Tab.Screen
        name={ROUTES.TAB_HOME}
        component={HomeStackNavigator}
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
      {/* 모임 */}
      <Tab.Screen
        name={ROUTES.TAB_GROUP}
        component={GroupStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.dispatch(
              CommonActions.navigate({
                name: ROUTES.TAB_GROUP,
                params: { screen: 'GroupList' },
              }),
            );
          },
        })}
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
