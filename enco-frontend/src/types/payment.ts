type paymentMethod = 'barcode' | 'qr';

interface PaymentState {
  paymentMethod: paymentMethod;
  barcode: () => void;
  qr: () => void;
}

export type { paymentMethod, PaymentState };
