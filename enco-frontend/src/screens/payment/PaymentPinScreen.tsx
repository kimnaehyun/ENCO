import { View, Alert } from 'react-native';
import React, { useState } from 'react';
import PinEntry from '../../components/pin/PinEntry';

const TEST_PIN = '258000';

export default function PaymentPinScreen({ navigation, route }: any) {
  const [resetKey, setResetKey] = useState(0);
  const { screen } = route.params;

  const handlePinComplete = (pin: string) => {
    const isValid = pin === TEST_PIN;

    if (isValid) {
      return navigation.navigate(screen);
    }

    Alert.alert('인증 실패', 'pin 번호가 올바르지 않습니다.');
    setResetKey(prev => prev + 1);
  };
  return (
    <View className="flex-1 p-5 gap-3">
      <PinEntry
        title="6자리 비밀번호를 입력하세요"
        resetKey={resetKey}
        length={6}
        onComplete={handlePinComplete}
      />
    </View>
  );
}
