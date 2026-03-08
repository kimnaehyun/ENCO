import { View, Text, Pressable } from 'react-native';
import { usePaymentStore } from '../../store/usePaymentStore';

export default function ToggleButton() {
  const paymentMethodType = usePaymentStore(state => state.paymentMethod);
  const barcode = usePaymentStore(state => state.barcode);
  const qr = usePaymentStore(state => state.qr);

  return (
    <View className="flex-row w-full items-center border-2 border-gray-300 rounded-lg overflow-hidden">
      <Pressable
        className={`flex-1 py-2 ${
          paymentMethodType === 'barcode' ? 'bg-blue-500' : 'bg-white'
        }`}
        onPress={() => barcode()}
      >
        <Text
          className={`text-center ${
            paymentMethodType === 'barcode' ? 'text-white' : 'text-black'
          }`}
        >
          바코드
        </Text>
      </Pressable>

      <Pressable
        className={`flex-1 py-2 ${paymentMethodType === 'qr' ? 'bg-blue-500' : 'bg-white'}`}
        onPress={() => qr()}
      >
        <Text
          className={`text-center ${
            paymentMethodType === 'qr' ? 'text-white' : 'text-black'
          }`}
        >
          QR 스캔
        </Text>
      </Pressable>
    </View>
  );
}
