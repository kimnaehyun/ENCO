import { Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';

type PaymentSuccessParams = {
  amount?: number;
  callbackUrl?: string;
  orderId?: string;
};

export default function PaymentSuccessScreen() {
  const route = useRoute();
  const { amount, callbackUrl, orderId } =
    (route.params ?? {}) as PaymentSuccessParams;

  return (
    <View className="flex items-center justify-center h-full">
      <Text className="border-solid border-black">
        {(amount ?? 0).toLocaleString()}원이 결제되었습니다.
      </Text>
      <Text>orderId: {orderId}</Text>
      <Text numberOfLines={1}>callback: {callbackUrl}</Text>
    </View>
  );
}