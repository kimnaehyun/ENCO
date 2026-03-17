import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateInternetPaymentRequestScreen from '../screens/InternetPayment/CreateInternetPaymentRequestScreen';
import PaymentApprovalPendingScreen from '../screens/InternetPayment/PaymentApprovalPendingScreen';
import PaymentSuccessScreen from '../screens/InternetPayment/PaymentSuccessScreen';
import PaymentPinScreen from '../screens/InternetPayment/PaymentPinScreen';
import InternetPaymentStartScreen from '../screens/InternetPayment/InternetPaymentStartScreen';
import SelectGroupScreen from '../screens/InternetPayment/SelectGroupScreen';
import CardChoiceScreen from '../screens/InternetPayment/CardChoiceScreen';

const Stack = createNativeStackNavigator();

export default function InternetPayNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="InternetPaymentStartScreen"
        component={InternetPaymentStartScreen}
      />
      <Stack.Screen name="SelectGroupScreen" component={SelectGroupScreen} />
      <Stack.Screen name="CardChoiceScreen" component={CardChoiceScreen} />
      <Stack.Screen name="PaymentPinScreen" component={PaymentPinScreen} />
      <Stack.Screen
        name="CreateInternetPaymentRequest"
        component={CreateInternetPaymentRequestScreen}
      />
      <Stack.Screen
        name="PaymentApprovalPending"
        component={PaymentApprovalPendingScreen}
      />

      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
    </Stack.Navigator>
  );
}
