import { Button, Text, View } from 'react-native';

export default function PaymentApprovalPendingScreen({ navigation }: any) {
  (() => {
    setTimeout(() => {
      navigation.navigate('PaymentPassword');
    }, 3000);
  })();
  return (
    <View className="flex items-center justify-center h-full">
      <Text>투표가 완료되어 다음 페이지로 넘어갑니다.</Text>
    </View>
  );
}
