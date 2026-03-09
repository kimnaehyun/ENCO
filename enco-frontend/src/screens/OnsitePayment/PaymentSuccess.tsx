import { View, Text } from 'react-native';
import React from 'react';
import { useRoute } from '@react-navigation/native';

export default function PaymentSuccess() {
  const route = useRoute<any>();

  const { storeName, amount } = route.params;

  return (
    <View>
      <Text>결제 성공</Text>
      <Text>매장: {storeName}</Text>
      <Text>금액: {amount}원</Text>
    </View>
  );
}
