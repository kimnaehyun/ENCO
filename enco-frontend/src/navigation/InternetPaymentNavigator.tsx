import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PaymentPinScreen from '../screens/InternetPayment/PaymentPinScreen';
import PaymentStartScreen from '../screens/payment/PaymentStartScreen';
import SelectGroupScreen from '../screens/payment/SelectGroupScreen';
import CardChoiceScreen from '../screens/InternetPayment/CardChoiceScreen';
import VoteCreateScreen from '../screens/InternetPayment/VoteCreateScreen';

const Stack = createNativeStackNavigator();

export default function InternetPayNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="PaymentStartScreen" component={PaymentStartScreen} />
      <Stack.Screen
        name="SelectGroupScreen"
        component={SelectGroupScreen}
        initialParams={{ paymentType: 'internet' }}
      />
      <Stack.Screen name="CardChoiceScreen" component={CardChoiceScreen} />
      <Stack.Screen name="VoteCreateScreen" component={VoteCreateScreen} />
      <Stack.Screen name="PaymentPinScreen" component={PaymentPinScreen} />
    </Stack.Navigator>
  );
}
