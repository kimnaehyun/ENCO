import { Alert } from 'react-native';
import React, { useState } from 'react';
import PinEntry from '../../components/pin/PinEntry';
import {
  CommonActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { voteApi } from '@/services/payment/vote';
import { ROUTES } from '@/constants/routes';

export default function PaymentPinScreen() {
  const [resetKey, setResetKey] = useState(0);
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as {
    groupId: number;
    cardId: number;
    title: string;
    description: string;
    storeName: string;
    amount: number;
  };

  const handlePinComplete = async (pin: string) => {
    try {
      const body = {
        groupId: params.groupId,
        cardId: params.cardId,
        password: pin,
        counterpartyBankName: '온라인 결제',
        counterpartyName: params.storeName,
        counterpartyBankAccountNumber: '123-456-789012',
        title: params.title,
        description: params.description,
        amount: params.amount,
      };
      console.log(body);

      await voteApi.create(body);
      console.log('handlePinComplete 호출됨');
      Alert.alert('완료', '투표가 생성되었습니다.', [
        {
          text: '확인',
          onPress: () =>
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: 'App',
                    state: { routes: [{ name: ROUTES.TAB_HOME }] },
                  },
                ],
              }),
            ),
        },
      ]);
    } catch (e: any) {
      console.log('에러 응답:', e.response?.data);
      console.log('에러 상태:', e.response?.status);
      Alert.alert(
        '인증 실패',
        JSON.stringify(e.response?.data) ?? 'pin 번호가 올바르지 않습니다.',
      );
    }

    setResetKey(prev => prev + 1);
  };
  return (
    <ScreenLayout className="p-4">
      <PinEntry
        title="4자리 비밀번호를 입력하세요"
        resetKey={resetKey}
        length={4}
        onComplete={handlePinComplete}
      />
    </ScreenLayout>
  );
}
