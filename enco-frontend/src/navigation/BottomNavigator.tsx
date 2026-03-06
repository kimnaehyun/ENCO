import { Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ROUTES } from './routes';

import HomeScreen from '../screens/HomeScreen';
import GroupStackNavigator from './GroupStackNavigator';
import GPSScanScreen from '../screens/OnsitePayment/GPSScanScreen';
// 하단 메뉴바 임시
// 결제 / 홈 / 모임 으로 설정

const Tab = createBottomTabNavigator();

export default function BottomNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
      }}
    >
      {/* 결제 */}
      <Tab.Screen
        name={ROUTES.TAB_PAYMENT}
        component={GPSScanScreen}
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
      {/* 홈 */}
      <Tab.Screen
        name={ROUTES.TAB_HOME}
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
      {/* 모임 */}
      <Tab.Screen
        name={ROUTES.TAB_GROUP}
        component={GroupStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: e => {
            // ✅ 탭 누르면 항상 모임목록으로
            e.preventDefault();
            (navigation as any).navigate(ROUTES.TAB_GROUP, {
              screen: 'GroupList',
            });
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
