import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateInternetPaymentRequestScreen from '../screens/InternetPayment/CreateInternetPaymentRequestScreen';
import PaymentApprovalPendingScreen from '../screens/InternetPayment/PaymentApprovalPendingScreen';
import PaymentSuccessScreen from '../screens/InternetPayment/PaymentSuccessScreen';
import PaymentPinScreen from '../screens/InternetPayment/PaymentPinScreen';

const Stack = createNativeStackNavigator();

export default function InternetPayNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackVisible: false,
      }}
    >
      <Stack.Screen
        name="CreateInternetPaymentRequest"
        component={CreateInternetPaymentRequestScreen}
      />
      <Stack.Screen
        name="PaymentApprovalPending"
        component={PaymentApprovalPendingScreen}
      />
      <Stack.Screen
        name="InternetPaymentPin"
        component={PaymentPinScreen}
        initialParams={{ screen: 'PaymentSuccess' }}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
    </Stack.Navigator>
  );
}
