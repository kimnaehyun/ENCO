import { Text, View } from 'react-native';
import { useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { InternetPayStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<
  InternetPayStackParamList,
  'PaymentApprovalPending'
>;

export default function PaymentApprovalPendingScreen({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('InternetPaymentPin');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View className="flex items-center justify-center h-full">
      <Text>투표가 완료되어 다음 페이지로 넘어갑니다.</Text>
    </View>
  );
}
