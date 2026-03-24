import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PaymentPinScreen from '../screens/InternetPayment/PaymentPinScreen';
import InternetPaymentStartScreen from '../screens/InternetPayment/InternetPaymentStartScreen';
import SelectGroupScreen from '../screens/InternetPayment/SelectGroupScreen';
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
      <Stack.Screen
        name="InternetPaymentStartScreen"
        component={InternetPaymentStartScreen}
      />
      <Stack.Screen name="SelectGroupScreen" component={SelectGroupScreen} />
      <Stack.Screen name="CardChoiceScreen" component={CardChoiceScreen} />
      <Stack.Screen name="VoteCreateScreen" component={VoteCreateScreen} />
      <Stack.Screen name="PaymentPinScreen" component={PaymentPinScreen} />
    </Stack.Navigator>
  );
}
