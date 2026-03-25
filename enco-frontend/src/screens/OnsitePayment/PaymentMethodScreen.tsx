import { View } from 'react-native';
import PaymentToggleButton from '../../components/onsite/PaymentToggleButton';
import Barcode from '../../components/onsite/Barcode/';
import QR from '../../components/onsite/QR';
import { usePaymentMethod } from '../../hooks/usePaymentMethod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';

export default function PaymentMethodScreen() {
  const { isBarcode } = usePaymentMethod();
  const insets = useSafeAreaInsets();

  const route = useRoute();
  const params = route.params as { title: string; groupId: number };

  return (
    <View className="flex-1 bg-[#636363] px-6">
      <View
        style={{ paddingTop: insets.top }}
        className={
          isBarcode ? 'my-5' : 'absolute top-0 left-0 right-0 z-50 m-5'
        }
      >
        <PaymentToggleButton />
      </View>
      <View className="flex-1">
        {isBarcode ? <Barcode groupId={params.groupId} /> : <QR />}
      </View>
    </View>
  );
}
