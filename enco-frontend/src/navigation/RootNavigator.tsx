import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import BottomNavigator from './BottomNavigator';
import { useAuthStore } from '../store/useAuthStore';

// 그룹 생성 플로우 (모달 스택으로 탭 히스토리와 완전 분리)
import GroupCreateScreen from '../screens/group/GroupCreateScreen';
import GroupCardRecommendScreen from '../screens/group/GroupCardRecommendScreen';
import GroupPinSetupScreen from '../screens/group/GroupPinSetupScreen';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined;
  // 그룹 생성 플로우: 탭과 완전히 독립된 모달 스택
  GroupCreate: undefined;
  GroupCardRecommend: {
    groupName: string;
    address: string;
    tags: string[];
  };
  GroupPinSetup: {
    groupName: string;
    address: string;
    tags: string[];
    selectedCardId: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [isBooting, setIsBooting] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const t = setTimeout(() => setIsBooting(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isBooting ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : user ? (
        <>
          {/* 메인 앱 (탭 네비게이터) */}
          <Stack.Screen name="App" component={BottomNavigator} />

          {/*
           * 그룹 생성 플로우: 모달로 띄워서 탭 스택과 완전 분리.
           * - HomeScreen / TogetherScreen 어디서 진입해도 동일하게 동작
           * - 완료 후 navigation.navigate('App', { screen: 'HomeTab', ... }) 으로
           *   루트 스택을 App 하나만 남기고 탭으로 복귀
           * - 뒤로가기(취소)는 자동으로 App 탭으로 돌아감
           */}
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen name="GroupCreate" component={GroupCreateScreen} />
            <Stack.Screen name="GroupCardRecommend" component={GroupCardRecommendScreen} />
            <Stack.Screen name="GroupPinSetup" component={GroupPinSetupScreen} />
          </Stack.Group>
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}