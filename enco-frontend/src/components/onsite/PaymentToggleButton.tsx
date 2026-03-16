import { View, Text, Pressable } from 'react-native';
import { usePaymentStore } from '../../store/usePaymentStore';
import { usePaymentMethod } from '../../hooks/usePaymentMethod';

export default function ToggleButton() {
  const barcode = usePaymentStore(state => state.barcode);
  const qr = usePaymentStore(state => state.qr);
  const { isBarcode } = usePaymentMethod();

  return (
    <View className="w-full bg-white border border-[#636363] rounded-[20px] overflow-hidden relative flex-row">
      <View
        className={`absolute top-0 bottom-0 w-1/2 bg-[#D9D9D9] rounded-[20px] ${
          isBarcode ? 'left-0' : 'left-1/2'
        }`}
      />

      <Pressable className="flex-1 py-2" onPress={barcode}>
        <Text className="text-center font-bold text-xl">QR코드</Text>
      </Pressable>

      <Pressable className="flex-1 py-2" onPress={qr}>
        <Text className="text-center font-bold text-xl">스캔하기</Text>
      </Pressable>
    </View>
  );
}
