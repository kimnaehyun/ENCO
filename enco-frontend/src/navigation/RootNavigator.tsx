import { useEffect, useState } from 'react';

/*--스크린--*/
import SplashScreen from '../screens/SplashScreen';
import AuthLandingScreen from '../screens/auth/AuthLandingScreen';
import SignupFormScreen from '../screens/auth/SignupFormScreen';
import SignupPinSetupScreen from '../screens/auth/SignupPinSetupScreen.tsx';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomNavigator from './BottomNavigator.tsx';

// const Stack = createNativeStackNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator();
export default function RootNavigator() {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsBooting(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    // <Stack.Navigator screenOptions={{ headerShown: false }}>
    //   {isBooting ? (
    //     <Stack.Screen name="Splash" component={SplashScreen} />
    //   ) : (
    //     <>
    //       <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
    //       <Stack.Screen name="SignupForm" component={SignupFormScreen} />
    //       <Stack.Screen
    //         name="SignupPinSetup"
    //         component={SignupPinSetupScreen}
    //       />
    //     </>
    //   )}
    // </Stack.Navigator>
    <Stack.Navigator>
      <Stack.Screen
        name="BottomNavigator"
        options={{ headerShown: false }}
        component={BottomNavigator}
      />
    </Stack.Navigator>
  );
}
