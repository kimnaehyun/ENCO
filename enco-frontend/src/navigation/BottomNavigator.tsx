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

  // 각 탭의 실제 스택 루트 스크린 이름 매핑
  const TAB_ROOT_SCREEN: Record<string, string> = {
    [ROUTES.TAB_PAYMENT]: 'PaymentStartScreen',
    [ROUTES.TAB_HOME]: 'Home',
    [ROUTES.TAB_GROUP]: 'MyPage',
  };

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
      screenListeners={({ navigation, route }) => ({
        tabPress: e => {
          // 탭을 누르면 해당 스택의 실제 루트로 이동 (stack reset)
          navigation.navigate(route.name, {
            screen: TAB_ROOT_SCREEN[route.name],
          });
        },
      })}
    >
      <Tab.Screen
        name={ROUTES.TAB_PAYMENT}
        component={OnsitePaymentNavigator}
        options={{
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
