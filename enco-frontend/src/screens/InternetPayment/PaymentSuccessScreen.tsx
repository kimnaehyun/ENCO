import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { Linking } from 'react-native';
import { useRoute } from '@react-navigation/native';

type Params = {
  amount?: string;
  callbackUrl?: string;
};

export default function PaymentSuccessScreen() {
  const route = useRoute();
  const { amount, callbackUrl } = (route.params ?? {}) as Params;

  useEffect(() => {
    if (!callbackUrl) return;

    const separator = callbackUrl.includes('?') ? '&' : '?';
    const returnUrl =
      `${callbackUrl}${separator}status=success` +
      (amount ? `&amount=${encodeURIComponent(amount)}` : '');

    const timer = setTimeout(() => {
      Linking.openURL(returnUrl).catch((err) => {
        console.log('웹 복귀 실패:', err);
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [callbackUrl, amount]);

  return (
    <View className="flex items-center justify-center h-full">
      <Text className="border-solid border-black">
        {amount ?? '0'}원이 결제되었습니다.
      </Text>
    </View>
  );
}