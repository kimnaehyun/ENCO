import React, { useEffect } from 'react';
import { Text, View, Linking, Pressable } from 'react-native';
import { useRoute } from '@react-navigation/native';

type Params = {
  amount?: number;
  callbackUrl?: string;
  orderId?: string;
};

export default function PaymentSuccessScreen() {
  const route = useRoute();
  const { amount, callbackUrl, orderId } = (route.params ?? {}) as Params;

  const handleCallback = async () => {
    if (!callbackUrl) return;

    const separator = callbackUrl.includes('?') ? '&' : '?';
    const returnUrl =
      `${callbackUrl}${separator}status=success` +
      (amount ? `&amount=${encodeURIComponent(String(amount))}` : '') +
      (orderId ? `&orderId=${encodeURIComponent(orderId)}` : '');

    console.log('returnUrl:', returnUrl);

    try {
      await Linking.openURL(returnUrl);
    } catch (error) {
      console.log('callback open 실패:', error);
    }
  };

  useEffect(() => {
    handleCallback();
  }, []);

  return (
    <View className="flex items-center justify-center h-full px-6">
      <Text>{(amount ?? 0).toLocaleString()}원이 결제되었습니다.</Text>
      <Text>orderId: {orderId}</Text>
      <Text numberOfLines={1}>callback: {callbackUrl}</Text>

      <Pressable
        onPress={handleCallback}
        className="border border-black rounded-xl px-4 py-2 mt-4"
      >
        <Text>웹으로 돌아가기</Text>
      </Pressable>
    </View>
  );
}