import {
  View,
  Text,
  Button,
  BackHandler,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import React, { useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { ROUTES } from '../../constants/routes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PaymentHistory from '../../components/paymentSuccess/PaymentHistory';

export default function PaymentSuccess({ navigation }: { navigation: any }) {
  // const route = useRoute<any>();
  // const { storeName, amount } = route.params;

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('App', {
        screen: ROUTES.TAB_HOME,
      });
      return true;
    });

    return () => sub.remove();
  }, [navigation]);

  const insets = useSafeAreaInsets();
  const infoItems = [
    { title: '사용카드', value: '회식주의자 카드' },
    { title: '잔액', value: '814,440원' },
    { title: '거래구분', value: '조사 필요' },
  ];
  return (
    <View
      className="flex-1 gap-6 bg-[#F3F4F6] p-4"
      style={{ paddingTop: insets.top }}
    >
      <View className="rounded-[20px] bg-white">
        <Text className="font-bold text-2xl p-4">모임 장부</Text>
      </View>
      <View className="flex-1 rounded-[20px] bg-white">
        <View className="flex-row pl-2 pt-4">
          <Text className="text-xl font-medium">2026-03-05</Text>
          <Text className="text-xl font-medium">맥도날드</Text>
        </View>
        <View className="p-6">
          <Text className="text-[#FF0000] text-3xl">-50,000원</Text>
        </View>
        <View className="flex px-6 gap-3">
          {infoItems.map(item => (
            <PaymentHistory key={item.title} title={item.title}>
              <Text>{item.value}</Text>
            </PaymentHistory>
          ))}
          <PaymentHistory title="메모">
            <TextInput placeholder="내용을 입력하세요"></TextInput>
          </PaymentHistory>
          <PaymentHistory title="영수증">
            <Pressable
              className="bg-[#DBDBDB] rounded-[20px] px-5 py-2"
              onPress={() => {
                Alert.alert('알림', 'asd');
              }}
            >
              <Text className="font-medium">증빙하기</Text>
            </Pressable>
          </PaymentHistory>
        </View>
      </View>
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
