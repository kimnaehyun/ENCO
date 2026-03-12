import { View, Text, Button } from 'react-native';
import React from 'react';
import { CommonActions, useRoute } from '@react-navigation/native';
import { ROUTES } from '../../constants/routes';

export default function PaymentSuccess({ navigation }: { navigation: any }) {
  const route = useRoute<any>();

  const { storeName, amount } = route.params;

  return (
    <View>
      <Text>결제 성공</Text>
      <Text>매장: {storeName}</Text>
      <Text>금액: {amount}원</Text>
      <Button
        title="확인"
        onPress={() => {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'App',
                  state: {
                    routes: [{ name: ROUTES.TAB_HOME }],
                  },
                },
              ],
            }),
          );
        }}
      />
    </View>
  );
}
