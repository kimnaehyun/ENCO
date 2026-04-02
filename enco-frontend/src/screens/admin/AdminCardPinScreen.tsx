import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { GroupStackParamList } from '@/types/navigation';
import { View } from 'react-native';
import PinEntry from '@/components/pin/PinEntry';

type AdminCardPinRouteProp = RouteProp<GroupStackParamList, 'AdminCardPin'>;
type AdminCardPinNavigationProp = NativeStackNavigationProp<
  GroupStackParamList,
  'AdminCardPin'
>;

export default function AdminCardPinScreen() {
  const navigation = useNavigation<AdminCardPinNavigationProp>();
  const route = useRoute<AdminCardPinRouteProp>();

  const { groupId, groupName, selectedCardId } = route.params;

  const handleComplete = (_pin: string) => {
    navigation.navigate('AdminCardDone', {
      groupId,
      groupName,
      selectedCardId,
    });
  };

  return (
    <View className="flex-1 bg-[#F0F4FF]">
      <PinEntry
        title="결제 비밀번호를\n입력해주세요"
        onComplete={handleComplete}
      />
    </View>
  );
}
