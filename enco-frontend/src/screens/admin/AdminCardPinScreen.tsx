// src/screens/admin/AdminCardPinScreen.tsx
// 카드 추가 발급 > PIN 확인 → 발급 완료
import { View } from 'react-native';
import PinEntry from '../../components/pin/PinEntry';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function AdminCardPinScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { groupId, groupName, selectedCardId } = route.params;

  const handleComplete = (_pin: string) => {
    navigation.navigate('AdminCardDone', {
      groupId,
      groupName,
      selectedCardId,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
      <PinEntry
        title="결제 비밀번호를\n입력해주세요"
        onComplete={handleComplete}
      />
    </View>
  );
}
