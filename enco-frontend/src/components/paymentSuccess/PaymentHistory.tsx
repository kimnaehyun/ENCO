import { View, Text } from 'react-native';
import React from 'react';

export default function PaymentHistory({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row justify-between">
      <Text>{title}</Text>
      {children}
    </View>
  );
}
