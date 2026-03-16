import { usePaymentStore } from '../store/usePaymentStore';

export function usePaymentMethod() {
  const paymentMethodType = usePaymentStore(state => state.paymentMethod);

  return {
    paymentMethodType,
    isBarcode: paymentMethodType === 'barcode',
  };
}
