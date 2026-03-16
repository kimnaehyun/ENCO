import { View, Alert } from 'react-native';
import React, { useState } from 'react';
import PinEntry from '../../components/pin/PinEntry';

const TEST_PIN = '258000';

export default function PaymentPinScreen() {
  const [resetKey, setResetKey] = useState(0);

  const handlePinComplete = (pin: string) => {
    const isValid = pin === TEST_PIN;

    if (isValid) {
    }

    Alert.alert('인증 실패', 'pin 번호가 올바르지 않습니다.');
    setResetKey(prev => prev + 1);
  };
  return (
    <View className="flex-1 p-5 gap-3 bg-[#F0F4FF]">
      <PinEntry
        title="6자리 비밀번호를 입력하세요"
        resetKey={resetKey}
        length={6}
        onComplete={handlePinComplete}
      />
    </View>
  );
}
