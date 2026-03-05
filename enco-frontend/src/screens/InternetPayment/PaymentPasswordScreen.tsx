import { Pressable, Text, View } from 'react-native';

export default function PaymentPasswordScreen({ navigation }: any) {
  return (
    <View className="flex items-center p-6 gap-4 w-full">
      <Pressable
        onPress={() => navigation.navigate('PaymentApprovalPending')}
        className="border border-black w-full rounded-xl py-3 items-center"
      >
        <Text className="font-bold">완료</Text>
      </Pressable>
    </View>
  );
}
