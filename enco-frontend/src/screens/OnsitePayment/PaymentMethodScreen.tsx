import { View } from 'react-native';
import PaymentToggleButton from '../../components/onsite/PaymentToggleButton';
import Barcode from '../../components/onsite/Barcode/';
import QR from '../../components/onsite/QR';
import { usePaymentStore } from '../../store/usePaymentStore';

export default function PaymentMethodScreen() {
  const paymentMethodType = usePaymentStore(state => state.paymentMethod);
  return (
    <View className="flex-1">
      <View
        className={
          paymentMethodType === 'barcode'
            ? ''
            : 'absolute top-0 left-0 right-0 z-50'
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
