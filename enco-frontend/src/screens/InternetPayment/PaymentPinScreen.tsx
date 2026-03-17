import { View, Alert } from 'react-native';
import React, { useState } from 'react';
import PinEntry from '../../components/pin/PinEntry';
import { useNavigation } from '@react-navigation/native';

const TEST_PIN = '2580';

export default function PaymentPinScreen() {
  const [resetKey, setResetKey] = useState(0);
  const navigation = useNavigation<any>();

  const handlePinComplete = (pin: string) => {
    const isValid = pin === TEST_PIN;

    if (isValid) {
      navigation.navigate('VoteCreateScreen');
    }

    Alert.alert('인증 실패', 'pin 번호가 올바르지 않습니다.');
    setResetKey(prev => prev + 1);
  };
  return (
    <View className="flex-1 p-5 gap-3 bg-[#F0F4FF]">
      <PinEntry
        title="4자리 비밀번호를 입력하세요"
        resetKey={resetKey}
        length={4}
        onComplete={handlePinComplete}
      />
    </View>
  );
}
