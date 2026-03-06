import { create } from 'zustand';
import { PaymentState } from '../types/payment';

export const usePaymentStore = create<PaymentState>(set => ({
  paymentMethod: 'barcode',
  barcode: () => set({ paymentMethod: 'barcode' }),
  qr: () => set({ paymentMethod: 'qr' }),
}));
