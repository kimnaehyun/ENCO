// src/screens/admin/AdminCardPinScreen.tsx
// 카드 추가 발급 > PIN 확인 → 발급 완료 (mock: 2580)
import { useState } from 'react';
import { View } from 'react-native';
import PinEntry from '../../components/pin/PinEntry';
import { useNavigation, useRoute } from '@react-navigation/native';

const MOCK_PIN = '2580';

export default function AdminCardPinScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { groupId, groupName, selectedCardId } = route.params;

  const [error, setError] = useState('');
  const [resetKey, setResetKey] = useState(0);

  const handleComplete = (pin: string) => {
    if (pin !== MOCK_PIN) {
      setError('비밀번호가 맞지 않아요');
      setResetKey(k => k + 1);
      return;
    }

    setError('');
    navigation.navigate('AdminCardDone', {
      groupId,
      groupName,
      selectedCardId,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
      <PinEntry
        key={resetKey}
        title={
          error
            ? `비밀번호가 맞지 않아요\n다시 입력해주세요`
            : `결제 비밀번호를\n입력해주세요`
        }
        resetKey={resetKey}
        onComplete={handleComplete}
      />
    </View>
  );
}
