type paymentMethod = 'barcode' | 'qr';

interface PaymentState {
  paymentMethod: paymentMethod;
  barcode: () => void;
  qr: () => void;
}

interface Group {
  groupId: string | number;
  groupName: string;
  role: string;
  account: string;
  card: string;
}

export type SelectedAccount = {
  bankName: string;
  accountNumber: string;
  label: string;
};

export type { paymentMethod, PaymentState, Group };
