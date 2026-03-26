import { View, Text, Button, BackHandler } from 'react-native';
import React, { useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { ROUTES } from '../../constants/routes';

export default function PaymentSuccess({ navigation }: { navigation: any }) {
  const route = useRoute<any>();

  const { storeName, amount } = route.params;

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('App', {
        screen: ROUTES.TAB_HOME,
      });
      return true;
    });

    return () => sub.remove();
  }, [navigation]);
  return (
    <View className="bg-[#F0F4FF]">
      <Text>결제 성공</Text>
      <Text>매장: {storeName}</Text>
      <Text>금액: {amount}원</Text>
      <Button
        title="확인"
        onPress={() => {
          navigation.navigate('App', {
            screen: ROUTES.TAB_HOME,
          });
        }}
      />
    </View>
  );
}
