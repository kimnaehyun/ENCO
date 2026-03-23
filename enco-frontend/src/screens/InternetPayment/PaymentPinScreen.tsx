import { View, Alert } from 'react-native';
import React, { useState } from 'react';
import PinEntry from '../../components/pin/PinEntry';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';

const TEST_PIN = '2580';

export default function PaymentPinScreen() {
  const [resetKey, setResetKey] = useState(0);
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as { groupId: number; cardId: number };
  const handlePinComplete = (pin: string) => {
    const isValid = pin === TEST_PIN;

    if (isValid) {
      return navigation.navigate('VoteCreateScreen', {
        groupId: params.groupId,
        cardId: params.cardId,
      });
    }

    Alert.alert('인증 실패', 'pin 번호가 올바르지 않습니다.');
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
