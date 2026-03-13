import { View } from 'react-native';
import PaymentToggleButton from '../../components/onsite/PaymentToggleButton';
import Barcode from '../../components/onsite/Barcode/';
import QR from '../../components/onsite/QR';
import { usePaymentStore } from '../../store/usePaymentStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PaymentMethodScreen() {
  const paymentMethodType = usePaymentStore(state => state.paymentMethod);

  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-[#636363] p-4">
      <View
        style={{ paddingTop: insets.top }}
        className={
          paymentMethodType === 'barcode'
            ? ''
            : 'absolute top-0 left-0 right-0 z-50 m-5'
        }
      >
        <PaymentToggleButton />
      </View>
      <View className="flex-1">
        {paymentMethodType === 'barcode' ? <Barcode /> : <QR />}
      </View>
    </View>
  );
}
