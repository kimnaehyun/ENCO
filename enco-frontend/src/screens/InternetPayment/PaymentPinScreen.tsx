import { Alert } from 'react-native';
import React, { useState } from 'react';
import PinEntry from '../../components/pin/PinEntry';
import { useNavigation, useRoute } from '@react-navigation/native';
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
  };

  const handlePinComplete = async (pin: string) => {
    try {
      const body = {
        groupId: params.groupId,
        cardId: params.cardId,
        password: pin,
        counterpartyBankName: '국민은행',
        counterpartyName: '어디엇혜역',
        counterpartyBankAccountNumber: '111-111',
        title: params.title,
        description: params.description,
        amount: 5000,
      };
      console.log(body);

      await voteApi.create(body);
      console.log('handlePinComplete 호출됨');
      Alert.alert('완료', '투표가 생성되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.getParent()?.navigate(ROUTES.TAB_HOME),
        },
      ]);
    } catch (e: any) {
      Alert.alert('인증 실패', 'pin 번호가 올바르지 않습니다.');
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
