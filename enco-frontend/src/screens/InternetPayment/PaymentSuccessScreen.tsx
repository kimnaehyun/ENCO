import { Text, View } from 'react-native';

export default function PaymentSuccessScreen() {
  return (
    <View className="flex items-center justify-center h-full">
      <Text className="border-solid border-black">결제가 완료되었습니다.</Text>
    </View>
  );
}
