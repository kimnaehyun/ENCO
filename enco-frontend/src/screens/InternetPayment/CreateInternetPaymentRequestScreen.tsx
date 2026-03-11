import { Pressable, Text, TextInput, View } from 'react-native';

export default function CreateInternetPaymentRequestScreen({
  navigation,
}: any) {
  return (
    <View className="flex items-center p-6 gap-4 ">
      <Text className="border-black border-solid border-2 text-xl font-bold text-center w-full rounded-xl py-2">
        투표 제의
      </Text>
      <TextInput
        className="border-black border-solid border-2 text-center w-full rounded-xl py-2"
        placeholder="의제"
      />
      <Text className="border-black border-solid border-2 text-center w-full rounded-xl py-2">
        금액
      </Text>
      <TextInput
        className="border-black border-solid border-2 text-center w-full rounded-xl py-2"
        placeholder="설명"
      />
      <TextInput
        className="border-black border-solid border-2 text-center w-full rounded-xl py-2"
        placeholder="마감 시간"
      />
      <Pressable
        onPress={() => navigation.replace('PaymentApprovalPending')}
        className="border border-black w-full rounded-xl py-3 items-center"
      >
        <Text className="font-bold">완료</Text>
      </Pressable>
    </View>
  );
}
